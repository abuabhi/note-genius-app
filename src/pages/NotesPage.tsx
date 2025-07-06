
import { OptimizedNotesContent } from '@/components/notes/page/OptimizedNotesContent';
import { NotesPageHeader } from '@/components/notes/page/NotesPageHeader';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { useState } from 'react';
import { useUserTier } from '@/hooks/useUserTier';
import { EnhancedImportDialog } from '@/components/notes/import/EnhancedImportDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateNoteForm } from '@/components/notes/page/CreateNoteForm';
import { Note } from '@/types/note';

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
  const { userTier } = useUserTier();

  // Convert ViewMode to the expected type for the header and content
  const convertedViewMode: 'grid' | 'list' = viewMode === 'compact' ? 'grid' : viewMode as 'grid' | 'list';
  
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    // This will be implemented by the form's internal logic
    setIsManualDialogOpen(false);
    return null;
  };

  return (
    // Removed background gradient - now handled by SidebarLayout
    <div className="h-full">
      <NotesPageHeader
        loading={false}
        viewMode={convertedViewMode}
        onViewModeChange={handleViewModeChange}
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
            <OptimizedNotesContent viewMode={convertedViewMode} />
          </OptimizedNotesProvider>
        </ErrorBoundary>
      </div>

      {/* Import Dialog */}
      <EnhancedImportDialog 
        isVisible={isImportDialogOpen} 
        onClose={() => setIsImportDialogOpen(false)}
        onSaveNote={async (note) => {
          return true;
        }}
        isPremiumUser={userTier === 'GRADUATE' || userTier === 'MASTER'}
      />

      {/* Manual Note Creation Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <CreateNoteForm onSave={handleSaveNote} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;
