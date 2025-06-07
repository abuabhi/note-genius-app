
import Layout from '@/components/layout/Layout';
import { NoteProvider } from '@/contexts/NoteContext';
import { NotesContent } from '@/components/notes/page/NotesContent';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { FileText } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="container mx-auto p-4 md:p-6">
    <Alert variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="mt-2">
        {error.message}
      </AlertDescription>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-4"
        onClick={resetErrorBoundary}
      >
        Try again
      </Button>
    </Alert>
  </div>
);

const NotesPage = () => {
  // Create placeholder functions for the required props
  const handleSaveNote = async (note: any) => {
    console.log('Save note:', note);
    return null;
  };

  const handleScanNote = async (note: any) => {
    console.log('Scan note:', note);
    return null;
  };

  const handleImportNote = async (note: any) => {
    console.log('Import note:', note);
    return null;
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Notes" pageIcon={<FileText className="h-3 w-3" />} />
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <NoteProvider>
            <NotesContent 
              onSaveNote={handleSaveNote}
              onScanNote={handleScanNote}
              onImportNote={handleImportNote}
            />
          </NoteProvider>
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default NotesPage;
