import React from 'react';
import { GoogleDocsAuthService } from '@/services/auth/GoogleDocsAuthService';
import { DocumentImportManager, DocumentItem } from './DocumentImportManager';
import { GoogleDocsImporter } from '@/services/googleDocsImporter';
import { DocumentContentProcessor } from '@/utils/documentContentProcessor';
import { SubjectClassifier } from '@/utils/subjectClassifier';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { getOrCreateSubjectId } from '@/utils/subjectHelpers';

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
    
    const subjectClassifier = new SubjectClassifier(subjects || []);
    let successCount = 0;
    let failureCount = 0;

    for (const result of results) {
      if (result.success) {
        try {
          const processed = DocumentContentProcessor.processDocument(result.document);
          
          const finalSubject = subjectClassifier.classifyContent(
            processed.content + ' ' + processed.title, 
            processed.suggestedSubject
          );
          
          const subjectId = await getOrCreateSubjectId(finalSubject);
          
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

    // Notify parent of successful imports
    if (successCount > 0 && onImportComplete) {
      onImportComplete();
    }

    if (failureCount > 0) {
      throw new Error(`Import completed with ${failureCount} failures`);
    }
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
    <DocumentImportManager
      authService={authService}
      provider="googledocs"
      onBack={onBack}
      onImport={handleImport}
      fetchDocuments={fetchGoogleDocs}
      onAuthStateChange={handleAuthStateChange}
    />
  );
};
