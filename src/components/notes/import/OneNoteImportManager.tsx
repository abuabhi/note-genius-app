import React, { useState } from 'react';
import { DocumentImportManager } from './DocumentImportManager';
import { OneNoteDocumentAuthService } from '@/services/auth/OneNoteDocumentAuthService';
import { fetchOneNoteDocuments, importOneNoteDocuments } from '@/services/import/oneNoteImportService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { SubjectConfirmationDialog, DocumentToConfirm } from './components/SubjectConfirmationDialog';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { getOrCreateSubjectId } from '@/utils/subjectHelpers';
import { analyzeContentForTitleAndSubject } from '@/utils/contentAnalysisUtils';
import { SubjectClassifier } from '@/utils/subjectClassifier';
import { useToast } from '@/hooks/use-toast';

interface OneNoteImportManagerProps {
  onBack: () => void;
  onSaveNote: (note: any) => Promise<boolean>;
  onImportComplete?: () => void;
  onAuthStart?: () => void;
  onAuthEnd?: () => void;
}

export const OneNoteImportManager: React.FC<OneNoteImportManagerProps> = ({
  onBack,
  onSaveNote,
  onImportComplete,
  onAuthStart,
  onAuthEnd
}) => {
  const { subjects } = useUserSubjects();
  const authService = OneNoteDocumentAuthService.getInstance();
  const { toast } = useToast();
  
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [documentsToConfirm, setDocumentsToConfirm] = useState<DocumentToConfirm[]>([]);
  const [pendingImportData, setPendingImportData] = useState<{
    documents: any[];
    accessToken: string;
    processedDocs: any[];
  } | null>(null);

  const handleImport = async (documents: any[], accessToken: string) => {
    if (!onSaveNote) {
      throw new Error('Save function not available');
    }

    onAuthStart?.();
    
    try {
      const classifier = new SubjectClassifier(subjects);
      const processedDocs: any[] = [];
      const docsToConfirm: DocumentToConfirm[] = [];

      // Process all documents first
      for (const doc of documents) {
        try {
          console.log(`📄 [ONENOTE] Processing document: ${doc.name}`);
          
          // Fetch the page content
          const contentResponse = await fetch(`https://graph.microsoft.com/v1.0/me/onenote/pages/${doc.id}/content`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (!contentResponse.ok) {
            throw new Error(`Failed to fetch page content: ${contentResponse.statusText}`);
          }

          const htmlContent = await contentResponse.text();
          const plainText = extractTextFromHtml(htmlContent);
          
          if (!plainText.trim()) {
            console.warn(`⚠️ [ONENOTE] Page "${doc.name}" appears to be empty, skipping`);
            continue;
          }

          // Analyze content for subject suggestion
          const contentAnalysis = analyzeContentForTitleAndSubject(plainText);
          const classifiedSubject = classifier.classifyContent(plainText, contentAnalysis.suggestedSubject);

          processedDocs.push({
            document: doc,
            content: plainText,
            analysis: contentAnalysis,
            suggestedSubject: classifiedSubject
          });
          
          docsToConfirm.push({
            id: doc.id,
            title: doc.name || 'Imported OneNote Page',
            content: plainText,
            suggestedSubject: classifiedSubject,
            confidence: contentAnalysis.confidence
          });
          
        } catch (error) {
          console.error(`❌ [ONENOTE] Error processing document "${doc.name}":`, error);
          toast({
            title: "Processing Error",
            description: `Failed to process document: ${doc.name}`,
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
      
    } catch (error) {
      console.error('Error in OneNote import:', error);
      onAuthEnd?.();
      throw error;
    }
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
            title: processedDoc.document.name || 'Imported OneNote Page',
            content: processedDoc.content,
            subject: updatedDoc.subject,
            subject_id: subjectId,
            tags: ['imported', 'onenote'],
            source: 'onenote_import',
            date: new Date().toISOString().split('T')[0],
            sourceType: 'import' as const,
            importData: {
              originalId: processedDoc.document.id,
              fileType: 'onenote',
              importedAt: new Date().toISOString(),
              createdTime: processedDoc.document.createdTime,
              modifiedTime: processedDoc.document.modifiedTime
            }
          };
          
          const success = await onSaveNote(noteData);
          
          if (success) {
            successCount++;
            console.log(`✅ [ONENOTE] Successfully saved note: ${noteData.title}`);
          } else {
            failureCount++;
            console.error(`❌ [ONENOTE] Failed to save note: ${noteData.title}`);
          }
          
        } catch (error) {
          console.error('Error saving OneNote document:', error);
          failureCount++;
        }
      }
    }

    // Clear pending data
    setPendingImportData(null);
    setDocumentsToConfirm([]);
    onAuthEnd?.();

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
    onAuthEnd?.();
  };

  const handleAuthStateChange = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      onAuthStart?.();
    } else {
      onAuthEnd?.();
    }
  };

  return (
    <div className="space-y-4">
      {/* School Account Notice */}
      <Alert className="border-mint-200 bg-mint-50">
        <Info className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          <strong>Using a school OneNote account?</strong> You may be asked to get admin permission. 
          As an alternative, you can export your notes as PDF and use our <strong>Files upload</strong> or <strong>Bulk PDF upload</strong> options instead.
        </AlertDescription>
      </Alert>

      <DocumentImportManager
        authService={authService}
        provider="onenote"
        onBack={onBack}
        onImport={handleImport}
        fetchDocuments={fetchOneNoteDocuments}
        onAuthStateChange={handleAuthStateChange}
      />
      
      <SubjectConfirmationDialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
        documents={documentsToConfirm}
        onConfirm={handleConfirmSubjects}
        onCancel={handleCancelConfirmation}
      />
    </div>
  );
};

// Helper function to extract plain text from HTML content
const extractTextFromHtml = (htmlContent: string): string => {
  try {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get text content and clean it up
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up excessive whitespace
    return textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    // Fallback: strip basic HTML tags with regex
    return htmlContent
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
};