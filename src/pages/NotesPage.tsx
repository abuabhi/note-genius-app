
import { OptimizedNotesContent } from '@/components/notes/page/OptimizedNotesContent';
import { NotesPageHeader } from '@/components/notes/page/NotesPageHeader';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { useState } from 'react';
import { ImportDialog } from '@/components/notes/import/ImportDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateNoteForm } from '@/components/notes/page/CreateNoteForm';

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
  const { viewMode, setViewMode } = useViewPreferences('notes');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <NotesPageHeader
        loading={false}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenManualDialog={() => setIsManualDialogOpen(true)}
        onOpenImportDialog={() => setIsImportDialogOpen(true)}
      />
      
      <div className="container mx-auto px-6 py-8">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            console.log('Resetting notes page error boundary');
          }}
          onError={(error, errorInfo) => {
            console.error('Notes page error caught by boundary:', error, errorInfo);
          }}
        >
          <OptimizedNotesProvider>
            <OptimizedNotesContent viewMode={viewMode} />
          </OptimizedNotesProvider>
        </ErrorBoundary>
      </div>

      {/* Import Dialog */}
      <ImportDialog 
        open={isImportDialogOpen} 
        onOpenChange={setIsImportDialogOpen} 
      />

      {/* Manual Note Creation Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <CreateNoteForm onSuccess={() => setIsManualDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
