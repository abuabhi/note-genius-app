import React from 'react';
import { DocumentImportManager } from './DocumentImportManager';
import { OneNoteDocumentAuthService } from '@/services/auth/OneNoteDocumentAuthService';
import { fetchOneNoteDocuments, importOneNoteDocuments } from '@/services/import/oneNoteImportService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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
  const authService = OneNoteDocumentAuthService.getInstance();

  const handleImport = async (documents: any[], accessToken: string) => {
    onAuthStart?.();
    
    try {
      await importOneNoteDocuments(documents, accessToken, onSaveNote);
      onImportComplete?.();
    } finally {
      onAuthEnd?.();
    }
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
    </div>
  );
};