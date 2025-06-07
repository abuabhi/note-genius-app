
import Layout from '@/components/layout/Layout';
import { OptimizedNoteProvider } from '@/contexts/OptimizedNoteContext';
import { NotesContent } from '@/components/notes/page/NotesContent';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { FileText } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { useOptimizedNotesContext } from '@/contexts/OptimizedNoteContext';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="container mx-auto p-4 md:p-6">
    <Alert variant="destructive">
      <AlertTitle>Notes Page Error</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p><strong>Error:</strong> {error.message}</p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
            Try again
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  </div>
);

const OptimizedNotesContent = () => {
  const { loading, error } = useOptimizedNotesContext();

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

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <AlertTitle>Failed to load notes</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProgressiveLoader 
      isLoading={loading}
      isPartiallyLoaded={!loading}
      skeletonCount={4}
    >
      <NotesContent 
        onSaveNote={handleSaveNote}
        onScanNote={handleScanNote}
        onImportNote={handleImportNote}
      />
    </ProgressiveLoader>
  );
};

const OptimizedNotesPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Notes" pageIcon={<FileText className="h-3 w-3" />} />
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => console.log('Resetting notes page error boundary')}
        >
          <OptimizedNoteProvider>
            <OptimizedNotesContent />
          </OptimizedNoteProvider>
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default OptimizedNotesPage;
