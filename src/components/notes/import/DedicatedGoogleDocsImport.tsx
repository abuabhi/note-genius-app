
import { useGoogleDocsAuth } from "@/integrations/google/googleDocsOAuth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GoogleDocsHeader } from "./google-docs/GoogleDocsHeader";
import { GoogleDocsErrorDisplay } from "./google-docs/GoogleDocsErrorDisplay";
import { GoogleDocsActionBar } from "./google-docs/GoogleDocsActionBar";
import { GoogleDocsList } from "./google-docs/GoogleDocsList";
import { GoogleDocsEmptyState } from "./google-docs/GoogleDocsEmptyState";
import { GoogleDocsImporter } from "@/services/googleDocsImporter";
import { DocumentContentProcessor } from "@/utils/documentContentProcessor";
import { SubjectClassifier } from "@/utils/subjectClassifier";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { getOrCreateSubjectId } from "@/utils/subjectHelpers";

interface DedicatedGoogleDocsImportProps {
  onConnected: (accessToken: string) => void;
  onBack: () => void;
  onSaveNote?: (note: any) => Promise<boolean>;
  onImportComplete?: () => void;
}

export const DedicatedGoogleDocsImport = ({ 
  onConnected, 
  onBack, 
  onSaveNote,
  onImportComplete 
}: DedicatedGoogleDocsImportProps) => {
  const { isAuthenticated, accessToken, userName, loading, error, connect, disconnect } = useGoogleDocsAuth();
  const [isRefreshingDocs, setIsRefreshingDocs] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const { subjects } = useUserSubjects();
  
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      onConnected(accessToken);
      fetchDocuments();
    }
  }, [isAuthenticated, accessToken, onConnected]);

  const fetchDocuments = async () => {
    if (!accessToken) {
      setDetailedError('No access token available. Please reconnect.');
      return;
    }
    
    setIsRefreshingDocs(true);
    setDetailedError(null);
    
    try {
      console.log('🔍 Fetching Google Docs with token:', accessToken.substring(0, 20) + '...');
      
      // Validate token with userinfo
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        throw new Error(`Token validation failed (${userInfoResponse.status}): ${errorText}`);
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('✅ Token validated successfully for user:', userInfo.email);
      
      // Fetch documents from Google Drive API
      const driveApiUrl = 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
        q: "mimeType='application/vnd.google-apps.document'",
        fields: 'files(id,name,createdTime,modifiedTime,owners,permissions)',
        orderBy: 'modifiedTime desc',
        pageSize: '20'
      });
      
      const driveResponse = await fetch(driveApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!driveResponse.ok) {
        const errorText = await driveResponse.text();
        let errorMessage = `Google Drive API Error (${driveResponse.status}): ${driveResponse.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = `${errorMessage}\n\nDetails: ${errorData.error.message || errorData.error}`;
            
            if (errorData.error.code === 403) {
              errorMessage += '\n\n🔧 Troubleshooting:\n• Enable Google Drive API in Google Cloud Console\n• Verify OAuth consent screen includes required scopes\n• Try disconnecting and reconnecting your account';
            }
          }
        } catch (e) {
          errorMessage += `\n\nRaw Response: ${errorText}`;
        }
        
        setDetailedError(errorMessage);
        throw new Error(errorMessage);
      }

      const driveData = await driveResponse.json();
      
      if (driveData.files && Array.isArray(driveData.files)) {
        setDocuments(driveData.files);
        toast.success(`Found ${driveData.files.length} Google Docs`);
        
        if (driveData.files.length === 0) {
          setDetailedError('No Google Docs found in your account. Create some documents in Google Drive first.');
        }
      } else {
        setDocuments([]);
        setDetailedError('Unexpected response format from Google Drive API');
      }
    } catch (error) {
      console.error('💥 Error fetching Google Docs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDetailedError(errorMessage);
      toast.error(`Failed to fetch Google Docs: ${errorMessage}`);
      setDocuments([]);
    } finally {
      setIsRefreshingDocs(false);
    }
  };

  const toggleDocSelection = (docId: string) => {
    console.log('Toggling selection for doc:', docId);
    setSelectedDocs(prev => {
      const newSelection = prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId];
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const handleSelectionChange = (docId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocs(prev => [...prev, docId]);
    } else {
      setSelectedDocs(prev => prev.filter(id => id !== docId));
    }
  };

  const importSelectedDocs = async () => {
    if (selectedDocs.length === 0) {
      toast.error('Please select at least one document to import');
      return;
    }

    if (!accessToken) {
      toast.error('Authentication required. Please reconnect.');
      return;
    }

    if (!onSaveNote) {
      toast.error('Import function not available');
      return;
    }

    setIsImporting(true);
    const toastId = toast.loading(`Importing ${selectedDocs.length} document${selectedDocs.length > 1 ? 's' : ''}...`);
    
    try {
      console.log('🚀 Starting import process for documents:', selectedDocs);
      
      const importer = new GoogleDocsImporter(accessToken);
      const results = await importer.importDocuments(selectedDocs);
      
      let successCount = 0;
      let failureCount = 0;
      
      const subjectClassifier = new SubjectClassifier(subjects || []);
      
      for (const result of results) {
        if (result.success) {
          try {
            // Process the document content
            const processed = DocumentContentProcessor.processDocument(result.document);
            
            // Classify subject based on user's existing subjects
            const finalSubject = subjectClassifier.classifyContent(
              processed.content + ' ' + processed.title, 
              processed.suggestedSubject
            );
            
            // Get or create subject ID
            const subjectId = await getOrCreateSubjectId(finalSubject);
            
            // Create note object
            const noteData = {
              title: processed.title,
              description: processed.description,
              content: processed.content,
              subject: finalSubject,
              subject_id: subjectId,
              date: new Date().toISOString().split('T')[0],
              sourceType: 'import' as const,
              importData: {
                originalFileUrl: `https://docs.google.com/document/d/${result.document.id}`,
                fileType: 'google-docs',
                importedAt: new Date().toISOString()
              }
            };
            
            console.log('📝 Creating note:', noteData.title);
            
            // Save the note
            const success = await onSaveNote(noteData);
            
            if (success) {
              successCount++;
              console.log(`✅ Successfully saved note: ${noteData.title}`);
            } else {
              failureCount++;
              console.error(`❌ Failed to save note: ${noteData.title}`);
            }
            
          } catch (error) {
            console.error('Error processing document:', error);
            failureCount++;
          }
        } else {
          failureCount++;
          console.error('Import failed for document:', result.error);
        }
      }
      
      toast.dismiss(toastId);
      
      // Show results
      if (successCount > 0 && failureCount === 0) {
        toast.success(`Successfully imported ${successCount} document${successCount > 1 ? 's' : ''}!`);
        
        // Close dialog and notify parent
        if (onImportComplete) {
          onImportComplete();
        }
        
        // Reset selection
        setSelectedDocs([]);
        
        // Go back to previous screen
        setTimeout(() => {
          onBack();
        }, 1000);
        
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(`Imported ${successCount} document${successCount > 1 ? 's' : ''}, ${failureCount} failed`);
      } else {
        toast.error(`Failed to import documents. Please try again.`);
      }
      
    } catch (error) {
      console.error('💥 Import process failed:', error);
      toast.dismiss(toastId);
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compact Header */}
      <div className="flex-shrink-0 space-y-4">
        <GoogleDocsHeader 
          isAuthenticated={isAuthenticated}
          userName={userName}
          onBack={onBack}
          onDisconnect={handleDisconnect}
        />

        <GoogleDocsErrorDisplay 
          error={error}
          detailedError={detailedError}
          showErrorDetails={showErrorDetails}
          onToggleErrorDetails={setShowErrorDetails}
        />

        <GoogleDocsActionBar 
          isAuthenticated={isAuthenticated}
          documentsCount={documents.length}
          selectedDocsCount={selectedDocs.length}
          isRefreshing={isRefreshingDocs}
          loading={loading || isImporting}
          onRefresh={fetchDocuments}
          onImport={importSelectedDocs}
          onConnect={connect}
          isImporting={isImporting}
        />
      </div>

      {/* Document List - Takes Remaining Space */}
      {isAuthenticated && (
        <div className="flex-1 mt-4 min-h-0 overflow-hidden">
          {documents.length > 0 ? (
            <GoogleDocsList 
              documents={documents}
              selectedDocs={selectedDocs}
              onToggleSelection={toggleDocSelection}
              onSelectionChange={handleSelectionChange}
            />
          ) : (
            <GoogleDocsEmptyState 
              isRefreshing={isRefreshingDocs}
              hasDetailedError={!!detailedError}
              onRefresh={fetchDocuments}
            />
          )}
        </div>
      )}
    </div>
  );
};
