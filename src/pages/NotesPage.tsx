
import { OptimizedNotesContent } from '@/components/notes/page/OptimizedNotesContent';
import { NotesPageHeader } from '@/components/notes/page/NotesPageHeader';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSimpleNotes } from '@/hooks/useSimpleNotes';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateNoteForm } from '@/components/notes/page/CreateNoteForm';
import { EnhancedImportDialog } from '@/components/notes/import/EnhancedImportDialog';

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

const NotesPageContent = () => {
  const { viewMode, setViewMode } = useViewPreferences('notes');
  const { addNote } = useSimpleNotes();
  
  // Dialog state
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert ViewMode to the expected type for the header and content
  const convertedViewMode: 'grid' | 'list' = viewMode === 'compact' ? 'grid' : viewMode as 'grid' | 'list';
  
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  // Note creation handlers using OptimizedNotesContext
  const handleSaveNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    if (isSubmitting) return null;
    
    setIsSubmitting(true);
    try {
      console.log('📝 [NOTES PAGE] Creating note via OptimizedNotesContext:', noteData.title);
      const result = await addNote(noteData);
      if (result) {
        console.log('✅ [NOTES PAGE] Note created successfully - UI should update immediately:', result.id);
        setIsManualDialogOpen(false);
        return result;
      } else {
        console.error('❌ [NOTES PAGE] Note creation failed - no result returned');
        // Still close the dialog even if creation failed
        setIsManualDialogOpen(false);
        return null;
      }
    } catch (error) {
      console.error('❌ [NOTES PAGE] Error creating note:', error);
      // Close dialog on error too
      setIsManualDialogOpen(false);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [addNote, isSubmitting]);

  const handleImportNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<boolean> => {
    if (isSubmitting) return false;
    
    setIsSubmitting(true);
    try {
      console.log('📥 [NOTES PAGE] Importing note via OptimizedNotesContext');
      const result = await addNote({ ...noteData, sourceType: 'import' });
      if (result) {
        console.log('✅ [NOTES PAGE] Note imported successfully - UI should update immediately:', result.id);
        setIsImportDialogOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [NOTES PAGE] Error importing note:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [addNote, isSubmitting]);

  return (
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
          <OptimizedNotesContent 
            viewMode={convertedViewMode} 
            onCreateNote={() => setIsManualDialogOpen(true)}
            onImportNote={() => setIsImportDialogOpen(true)}
          />
        </ErrorBoundary>
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={(open) => {
        if (!isSubmitting) setIsManualDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-mint-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-mint-800">Create New Note</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <CreateNoteForm onSave={handleSaveNote} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Import Dialog */}
      <EnhancedImportDialog 
        onSaveNote={handleImportNote}
        isVisible={isImportDialogOpen}
        onClose={() => {
          if (!isSubmitting) setIsImportDialogOpen(false);
        }}
        isPremiumUser={true}
      />
    </div>
  );
};

const NotesPage = () => {
  return <NotesPageContent />;
};

export default NotesPage;
