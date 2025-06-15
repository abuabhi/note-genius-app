
import { useState } from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { Note } from '@/types/note';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { OptimizedNotesFilters } from './OptimizedNotesFilters';
import { OptimizedNotesGrid } from './OptimizedNotesGrid';
import { OptimizedNotesPagination } from './OptimizedNotesPagination';
import { ErrorState } from './ErrorState';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { toast } from 'sonner';

export const OptimizedNotesContent = () => {
  const {
    notes,
    totalCount,
    loading,
    error,
    searchTerm,
    selectedSubject,
    currentPage,
    setCurrentPage,
    refreshNotes,
    updateNote,
    deleteNote
  } = useOptimizedNotes();

  // SINGLE SOURCE OF TRUTH for view mode - only defined here
  const { viewMode, setViewMode } = useViewPreferences('notes');

  console.log('🎯 OptimizedNotesContent - MASTER viewMode:', viewMode);

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
        message={`Failed to load notes: ${error || 'Unknown error'}`}
        onRetry={refreshNotes}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
        <OptimizedNotesFilters 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Main content with improved loading states */}
      <ProgressiveLoader 
        isLoading={loading}
        isPartiallyLoaded={notes.length > 0}
        skeletonCount={6}
      >
        {notes.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5">
            <EmptyNotesState
              onCreateNote={() => {}}
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
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
                  <OptimizedNotesPagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={20}
                    onPageChange={setCurrentPage}
                    hasMore={false}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </ProgressiveLoader>
    </div>
  );
};
