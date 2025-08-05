import React, { useState } from 'react';
import { GoogleDocsAuthService } from '@/services/auth/GoogleDocsAuthService';
import { DocumentImportManager, DocumentItem } from './DocumentImportManager';
import { GoogleDocsImporter } from '@/services/googleDocsImporter';
import { DocumentContentProcessor } from '@/utils/documentContentProcessor';
import { SubjectClassifier } from '@/utils/subjectClassifier';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { getOrCreateSubjectId } from '@/utils/subjectHelpers';
import { SubjectConfirmationDialog, DocumentToConfirm } from './components/SubjectConfirmationDialog';
import { analyzeContentForTitleAndSubject } from '@/utils/contentAnalysisUtils';
import { useToast } from '@/hooks/use-toast';

interface DedicatedGoogleDocsImportProps {
  onConnected: (accessToken: string) => void;
  onBack: () => void;
  onSaveNote?: (note: any) => Promise<boolean>;
  onImportComplete?: () => void;
  onAuthStart?: () => void;
  onAuthEnd?: () => void;
}

export const DedicatedGoogleDocsImport = ({ 
  onConnected, 
  onBack, 
  onSaveNote,
  onImportComplete,
  onAuthStart,
  onAuthEnd 
}: DedicatedGoogleDocsImportProps) => {
  const { subjects } = useUserSubjects();
  const authService = GoogleDocsAuthService.getInstance();
  const { toast } = useToast();
  
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [documentsToConfirm, setDocumentsToConfirm] = useState<DocumentToConfirm[]>([]);
  const [pendingImportData, setPendingImportData] = useState<{
    documents: DocumentItem[];
    accessToken: string;
    processedDocs: any[];
  } | null>(null);

  const fetchGoogleDocs = async (accessToken: string): Promise<DocumentItem[]> => {
    // Validate token first
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error(`Token validation failed: ${userInfoResponse.statusText}`);
    }

    // Fetch documents from Google Drive
    const driveApiUrl = 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: 'files(id,name,createdTime,modifiedTime,owners,permissions)',
      orderBy: 'modifiedTime desc',
      pageSize: '20'
    });

    const driveResponse = await fetch(driveApiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!driveResponse.ok) {
      const errorText = await driveResponse.text();
      let errorMessage = `Google Drive API Error: ${driveResponse.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage += ` - ${errorData.error.message}`;
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      throw new Error(errorMessage);
    }

    const data = await driveResponse.json();
    return data.files || [];
  };

  const handleImport = async (documents: DocumentItem[], accessToken: string) => {
    if (!onSaveNote) {
      throw new Error('Save function not available');
    }

    const importer = new GoogleDocsImporter(accessToken);
    const results = await importer.importDocuments(documents.map(doc => doc.id));
    
    const processedDocs: any[] = [];
    const docsToConfirm: DocumentToConfirm[] = [];

    // Process all documents and prepare them for confirmation
    for (const result of results) {
      if (result.success) {
        try {
          const processed = DocumentContentProcessor.processDocument(result.document);
          
          // Use enhanced content analysis for better subject detection
          const contentAnalysis = analyzeContentForTitleAndSubject(
            processed.content + ' ' + processed.title
          );
          
          processedDocs.push({
            processed,
            document: result.document,
            analysis: contentAnalysis
          });
          
          docsToConfirm.push({
            id: result.document.id,
            title: processed.title,
            content: processed.content,
            suggestedSubject: contentAnalysis.suggestedSubject,
            confidence: contentAnalysis.confidence
          });
          
        } catch (error) {
          console.error('Error processing document:', error);
          toast({
            title: "Processing Error",
            description: `Failed to process document: ${result.document.title}`,
            variant: "destructive"
          });
        }
      } else {
        console.error('Import failed for document:', result.error);
        toast({
          title: "Import Error", 
          description: `Failed to import document: ${result.error}`,
          variant: "destructive"
        });
      }
    }

    if (docsToConfirm.length === 0) {
      throw new Error('No documents were successfully processed');
    }

    // Store data for after confirmation
    setPendingImportData({
      documents,
      accessToken,
      processedDocs
    });
    
    setDocumentsToConfirm(docsToConfirm);
    setShowConfirmationDialog(true);
  };

  const handleConfirmSubjects = async (updatedDocuments: { id: string; subject: string }[]) => {
    if (!pendingImportData || !onSaveNote) {
      return;
    }

    setShowConfirmationDialog(false);
    
    let successCount = 0;
    let failureCount = 0;

    for (const updatedDoc of updatedDocuments) {
      const processedDoc = pendingImportData.processedDocs.find(
        doc => doc.document.id === updatedDoc.id
      );
      
      if (processedDoc) {
        try {
          const subjectId = await getOrCreateSubjectId(updatedDoc.subject);
          
          const noteData = {
            title: processedDoc.processed.title,
            description: processedDoc.processed.description,
            content: processedDoc.processed.content,
            subject: updatedDoc.subject,
            subject_id: subjectId,
            date: new Date().toISOString().split('T')[0],
            sourceType: 'import' as const,
            importData: {
              originalFileUrl: `https://docs.google.com/document/d/${processedDoc.document.id}`,
              fileType: 'google-docs',
              importedAt: new Date().toISOString()
            }
          };
          
          const success = await onSaveNote(noteData);
          
          if (success) {
            successCount++;
            console.log(`✅ Successfully saved note: ${noteData.title}`);
          } else {
            failureCount++;
            console.error(`❌ Failed to save note: ${noteData.title}`);
          }
          
        } catch (error) {
          console.error('Error saving document:', error);
          failureCount++;
        }
      }
    }

    // Clear pending data
    setPendingImportData(null);
    setDocumentsToConfirm([]);

    // Show results
    if (successCount > 0) {
      toast({
        title: "Import Successful",
        description: `Successfully imported ${successCount} document${successCount !== 1 ? 's' : ''}`,
      });
      
      if (onImportComplete) {
        onImportComplete();
      }
    }

    if (failureCount > 0) {
      toast({
        title: "Partial Import Failure",
        description: `${failureCount} document${failureCount !== 1 ? 's' : ''} failed to import`,
        variant: "destructive"
      });
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationDialog(false);
    setPendingImportData(null);
    setDocumentsToConfirm([]);
  };

  const handleAuthStateChange = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      // Get current credentials and notify parent
      authService.getAuthState().then(state => {
        if (state.credentials?.accessToken) {
          onConnected(state.credentials.accessToken);
        }
      });
      
      if (onAuthEnd) {
        onAuthEnd();
      }
    }
  };

  return (
    <>
      <DocumentImportManager
        authService={authService}
        provider="googledocs"
        onBack={onBack}
        onImport={handleImport}
        fetchDocuments={fetchGoogleDocs}
        onAuthStateChange={handleAuthStateChange}
      />
      
      <SubjectConfirmationDialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
        documents={documentsToConfirm}
        onConfirm={handleConfirmSubjects}
        onCancel={handleCancelConfirmation}
      />
    </>
  );
};
