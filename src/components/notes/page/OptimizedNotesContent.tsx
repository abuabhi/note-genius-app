
import { useState } from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { Note } from '@/types/note';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { OptimizedNotesHeader } from './OptimizedNotesHeader';
import { OptimizedNotesFilters } from './OptimizedNotesFilters';
import { OptimizedNotesGrid } from './OptimizedNotesGrid';
import { OptimizedNotesPagination } from './OptimizedNotesPagination';
import { ErrorState } from './ErrorState';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { DialogManager } from './header/DialogManager';
import { useUserTier } from '@/hooks/useUserTier';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { toast } from 'sonner';

export const OptimizedNotesContent = () => {
  const {
    notes,
    totalCount,
    hasMore,
    isLoading,
    error,
    searchTerm,
    selectedSubject,
    currentPage,
    setCurrentPage,
    refetch,
    addNote,
    updateNote,
    deleteNote
  } = useOptimizedNotes();

  const { tierLimits } = useUserTier();
  
  // SINGLE SOURCE OF TRUTH for view mode - only defined here
  const { viewMode, setViewMode } = useViewPreferences('notes');
  
  // Dialog states
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [creatingNote, setCreatingNote] = useState(false);

  console.log('🎯 OptimizedNotesContent - MASTER viewMode:', viewMode);

  const handleCreateNote = async () => {
    setCreatingNote(true);
    try {
      await addNote({
        title: 'New Note',
        description: 'Enter your note description here...',
        content: '',
        date: new Date().toISOString().split('T')[0],
        category: 'General',
        sourceType: 'manual'
      });
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
    } finally {
      setCreatingNote(false);
      setIsManualDialogOpen(false);
    }
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const newNote = await addNote(noteData);
      if (newNote) {
        toast.success('Note created successfully');
        return newNote;
      }
      return null;
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
      return null;
    }
  };

  const handleScanNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    return handleSaveNote({ ...noteData, sourceType: 'scan' });
  };

  const handleImportNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    return handleSaveNote({ ...noteData, sourceType: 'import' });
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      await updateNote(id, { pinned: !isPinned });
      toast.success(isPinned ? "Note unpinned" : "Note pinned");
    } catch (error) {
      console.error('Error pinning note:', error);
      toast.error('Failed to update note pin status');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteNote(id);
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
      throw error;
    }
  };

  if (error) {
    return (
      <ErrorState 
        message={`Failed to load notes: ${error.message || 'Unknown error'}`}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with better visual hierarchy */}
      <div className="bg-gradient-to-r from-white/95 to-mint-50/50 backdrop-blur-sm rounded-2xl border border-mint-100/60 shadow-lg shadow-mint-500/10">
        <OptimizedNotesHeader 
          totalCount={totalCount}
          onCreateNote={() => setIsManualDialogOpen(true)}
          onOpenScanDialog={() => setIsScanDialogOpen(true)}
          onOpenImportDialog={() => setIsImportDialogOpen(true)}
          isCreating={creatingNote}
        />
      </div>

      {/* Enhanced Filters with better spacing */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-sm p-4">
        <OptimizedNotesFilters 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Main content with improved loading states */}
      <ProgressiveLoader 
        isLoading={isLoading}
        isPartiallyLoaded={notes.length > 0}
        skeletonCount={6}
      >
        {notes.length === 0 ? (
          <div className="bg-gradient-to-br from-mint-50/30 to-blue-50/20 rounded-2xl border border-mint-100/40 shadow-sm">
            <EmptyNotesState
              onCreateNote={() => setIsManualDialogOpen(true)}
              isFiltered={!!(searchTerm || selectedSubject !== 'all')}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="transition-all duration-300 ease-in-out">
              <OptimizedNotesGrid 
                notes={notes} 
                onPin={handlePin}
                onDelete={handleDelete}
                viewMode={viewMode}
              />
            </div>
            
            {totalCount > 20 && (
              <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-sm p-4">
                  <OptimizedNotesPagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={20}
                    onPageChange={setCurrentPage}
                    hasMore={hasMore}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </ProgressiveLoader>

      {/* Dialog Manager for note creation */}
      <DialogManager 
        onSaveNote={handleSaveNote}
        onScanNote={handleScanNote}
        onImportNote={handleImportNote}
        tierLimits={tierLimits}
        isManualDialogOpen={isManualDialogOpen}
        isScanDialogOpen={isScanDialogOpen}
        isImportDialogOpen={isImportDialogOpen}
        isSubmitting={creatingNote}
        setIsManualDialogOpen={setIsManualDialogOpen}
        setIsScanDialogOpen={setIsScanDialogOpen}
        setIsImportDialogOpen={setIsImportDialogOpen}
      />
    </div>
  );
};
