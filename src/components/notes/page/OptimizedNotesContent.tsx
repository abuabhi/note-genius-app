
import { useState } from 'react';
import { Note } from '@/types/note';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { OptimizedNotesFilters } from './OptimizedNotesFilters';
import { OptimizedNotesGrid } from './OptimizedNotesGrid';
import { ErrorState } from './ErrorState';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Use selective hooks to minimize re-renders
import { useNotesWithPagination, useNotesFiltersOnly, useNotesOperationsOnly } from '@/hooks/notes/useSelectiveNotesContext';

export const OptimizedNotesContent = () => {
  // Use selective hooks instead of the monolithic context
  const {
    notes,
    totalCount,
    loading,
    hasMore,
    loadMore
  } = useNotesWithPagination();

  const {
    searchTerm,
    selectedSubject
  } = useNotesFiltersOnly();

  const {
    updateNote,
    deleteNote
  } = useNotesOperationsOnly();

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

  // Create a separate error handling component to avoid re-renders
  const ErrorHandler = () => {
    const { refreshNotes, error } = useNotesWithPagination();
    
    if (error) {
      return (
        <ErrorState 
          message={`Failed to load notes: ${error || 'Unknown error'}`}
          onRetry={refreshNotes}
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Error handling */}
      <ErrorHandler />

      {/* Enhanced Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
        <OptimizedNotesFilters 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Main content with improved loading states */}
      <ProgressiveLoader 
        isLoading={loading && notes.length === 0}
        isPartiallyLoaded={notes.length > 0}
        skeletonCount={6}
      >
        {notes.length === 0 && !loading ? (
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
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-mint-600 hover:bg-mint-700 text-white px-8 py-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      `Load More Notes (${totalCount - notes.length} remaining)`
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Notes Counter */}
            {totalCount > 0 && (
              <div className="text-center text-sm text-gray-500">
                Showing {notes.length} of {totalCount} notes
              </div>
            )}
          </div>
        )}
      </ProgressiveLoader>
    </div>
  );
};
