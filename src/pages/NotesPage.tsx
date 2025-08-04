
import { NotesPageHeader } from '@/components/notes/page/NotesPageHeader';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { useState, useCallback } from 'react';
import { Note } from '@/types/note';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateNoteForm } from '@/components/notes/page/CreateNoteForm';
import { EnhancedImportDialog } from '@/components/notes/import/EnhancedImportDialog';
import { NotesFilters } from '@/components/notes/NotesFilters';
import { NotesGrid } from '@/components/notes/NotesGrid';
import { useNotes } from '@/hooks/useNotes';
import { toast } from 'sonner';


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
  
  // Use the simplified notes hook - single source of truth
  const {
    notes,
    totalCount,
    loading,
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    sortType,
    setSortType,
    hasActiveFilters,
    activeFilterCount,
    clearFilters,
    addNote,
    updateNote,
    deleteNote,
    isCreating
  } = useNotes();
  
  // Dialog state
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Convert ViewMode to the expected type for the header and content
  const convertedViewMode: 'grid' | 'list' = viewMode === 'compact' ? 'grid' : viewMode as 'grid' | 'list';
  
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  // Note creation handlers using simplified architecture
  const handleSaveNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    console.log('📄 [NOTES PAGE] handleSaveNote called with:', noteData);
    if (isCreating) return null;
    
    try {
      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Note creation timed out')), 15000)
      );
      
      const result = await Promise.race([addNote(noteData), timeoutPromise]);
      console.log('📄 [NOTES PAGE] addNote result:', result);
      
      if (result) {
        console.log('📄 [NOTES PAGE] ✅ Note saved successfully - closing dialog');
        setIsManualDialogOpen(false);
        setIsImportDialogOpen(false);
        toast.success('Note created successfully!');
        return result;
      } else {
        console.log('❌ [NOTES PAGE] Note save failed - result was null');
        toast.error('Failed to create note - no data returned');
        return null;
      }
    } catch (error) {
      console.error("❌ [NOTES PAGE] Error saving note:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create note: ${errorMessage}`);
      setIsManualDialogOpen(false);
      return null;
    }
  }, [addNote, isCreating]);

  const handleImportNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<boolean> => {
    if (isCreating) return false;
    
    try {
      console.log('📥 [NOTES PAGE] Importing note');
      const result = await addNote({ ...noteData, sourceType: noteData.sourceType || 'import' });
      if (result) {
        console.log('✅ [NOTES PAGE] Note imported successfully:', result.id);
        // Don't close dialog after import - let user import multiple documents
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [NOTES PAGE] Error importing note:', error);
      return false;
    }
  }, [addNote, isCreating]);

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
          <div className="space-y-6">
            <NotesFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              sortType={sortType}
              setSortType={setSortType}
              hasActiveFilters={hasActiveFilters}
              activeFilterCount={activeFilterCount}
              clearFilters={clearFilters}
              loading={loading}
              totalCount={totalCount}
            />
            
            <NotesGrid
              notes={notes}
              viewMode={convertedViewMode}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
              onCreateNote={() => setIsManualDialogOpen(true)}
              onImportNote={() => setIsImportDialogOpen(true)}
              loading={loading}
              hasActiveFilters={hasActiveFilters}
              selectedSubject={selectedSubject}
            />
          </div>
        </ErrorBoundary>
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={(open) => {
        if (!isCreating) setIsManualDialogOpen(open);
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
          if (!isCreating) setIsImportDialogOpen(false);
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
