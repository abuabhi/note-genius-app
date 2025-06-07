
import Layout from '@/components/layout/Layout';
import { NoteProvider } from '@/contexts/NoteContext';
import { NotesContent } from '@/components/notes/page/NotesContent';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { FileText } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Enhanced error fallback component with better debugging
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  console.error('NotesPage Error:', error);
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <Alert variant="destructive">
        <AlertTitle>Notes Page Error</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p><strong>Error:</strong> {error.message}</p>
          <p><strong>Location:</strong> Notes page failed to load</p>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetErrorBoundary}
            >
              Try again
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

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
          onReset={() => {
            console.log('Resetting notes page error boundary');
          }}
          onError={(error, errorInfo) => {
            console.error('Notes page error caught by boundary:', error, errorInfo);
          }}
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
