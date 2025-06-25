import { useEffect, useCallback } from 'react';
import { useNotesStateMachine } from './useNotesStateMachine';
import { useOptimizedNotesWithQuery } from '../useOptimizedNotesWithQuery';
import { Note } from '@/types/note';

/**
 * Hook that combines the notes state machine with the data fetching logic
 * This provides a clean interface with predictable state transitions
 */
export const useNotesWithStateMachine = () => {
  const stateMachine = useNotesStateMachine();
  const queryHook = useOptimizedNotesWithQuery();

  // Sync query hook state with state machine
  useEffect(() => {
    if (queryHook.loading && !stateMachine.isBackgroundLoading) {
      stateMachine.actions.startFetch();
    }
  }, [queryHook.loading]);

  useEffect(() => {
    if (!queryHook.loading && queryHook.notes.length > 0) {
      stateMachine.actions.fetchSuccess(
        queryHook.notes,
        queryHook.totalCount,
        queryHook.hasMore
      );
    }
  }, [queryHook.loading, queryHook.notes, queryHook.totalCount, queryHook.hasMore]);

  useEffect(() => {
    if (queryHook.error && !stateMachine.hasError) {
      stateMachine.actions.fetchError(queryHook.error);
    }
  }, [queryHook.error]);

  // Enhanced operations with state machine integration
  const operations = {
    addNote: useCallback(async (noteData: Omit<Note, 'id'>) => {
      stateMachine.actions.startCreate();
      try {
        const result = await queryHook.addNote(noteData);
        if (result) {
          stateMachine.actions.createSuccess(result);
          return result;
        } else {
          stateMachine.actions.createError('Failed to create note');
          return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
        stateMachine.actions.createError(errorMessage);
        return null;
      }
    }, [queryHook.addNote, stateMachine.actions]),

    updateNote: useCallback(async (id: string, updates: Partial<Note>) => {
      stateMachine.actions.startUpdate(id);
      try {
        await queryHook.updateNote(id, updates);
        // Find the updated note (we'll need to refetch or optimistically update)
        const updatedNote = stateMachine.notes.find(note => note.id === id);
        if (updatedNote) {
          stateMachine.actions.updateSuccess({ ...updatedNote, ...updates });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
        stateMachine.actions.updateError(errorMessage, id);
        throw error;
      }
    }, [queryHook.updateNote, stateMachine.actions, stateMachine.notes]),

    deleteNote: useCallback(async (id: string) => {
      stateMachine.actions.startDelete(id);
      try {
        await queryHook.deleteNote(id);
        stateMachine.actions.deleteSuccess(id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
        stateMachine.actions.deleteError(errorMessage, id);
        throw error;
      }
    }, [queryHook.deleteNote, stateMachine.actions]),

    pinNote: useCallback(async (id: string, pinned: boolean) => {
      stateMachine.actions.startUpdate(id);
      try {
        await queryHook.pinNote(id, pinned);
        const updatedNote = stateMachine.notes.find(note => note.id === id);
        if (updatedNote) {
          stateMachine.actions.updateSuccess({ ...updatedNote, pinned });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to pin note';
        stateMachine.actions.updateError(errorMessage, id);
        throw error;
      }
    }, [queryHook.pinNote, stateMachine.actions, stateMachine.notes]),
  };

  // Enhanced refresh with state machine
  const refreshNotes = useCallback(async () => {
    stateMachine.actions.startRefresh();
    try {
      await queryHook.refreshNotes();
      // The useEffect above will handle the success case
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh notes';
      stateMachine.actions.fetchError(errorMessage);
    }
  }, [queryHook.refreshNotes, stateMachine.actions]);

  // Filter operations with state machine
  const applyFilters = useCallback(async () => {
    stateMachine.actions.startFilter();
    // The existing query hook will handle the actual filtering
    // and the useEffects above will sync the results
  }, [stateMachine.actions]);

  // Pagination with state machine
  const loadMore = useCallback(async () => {
    if (stateMachine.hasMore) {
      stateMachine.actions.startPaginate();
      try {
        await queryHook.loadMore();
        // The useEffect above will handle the success case
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load more notes';
        stateMachine.actions.fetchError(errorMessage);
      }
    }
  }, [queryHook.loadMore, stateMachine.hasMore, stateMachine.actions]);

  return {
    // State machine state and selectors
    state: stateMachine.state,
    notes: stateMachine.notes,
    totalCount: stateMachine.totalCount,
    hasMore: stateMachine.hasMore,
    error: stateMachine.error,
    loading: stateMachine.loading,
    
    // Enhanced state selectors
    isInitialLoading: stateMachine.isInitialLoading,
    isBackgroundLoading: stateMachine.isBackgroundLoading,
    isRefreshing: stateMachine.isRefreshing,
    isFiltering: stateMachine.isFiltering,
    isPaginating: stateMachine.isPaginating,
    
    // Operation states
    isCreating: stateMachine.isCreatingNote,
    isUpdating: stateMachine.isUpdating,
    isDeleting: stateMachine.isDeleting,
    isUpdatingNote: stateMachine.isUpdatingNote,
    isDeletingNote: stateMachine.isDeletingNote,
    
    // Data state selectors
    hasNotes: stateMachine.hasNotes,
    isEmpty: stateMachine.isEmpty,
    hasError: stateMachine.hasError,
    canRetry: stateMachine.canRetry,
    
    // Filter state from query hook (unchanged for now)
    searchTerm: queryHook.searchTerm,
    setSearchTerm: queryHook.setSearchTerm,
    selectedSubject: queryHook.selectedSubject,
    setSelectedSubject: queryHook.setSelectedSubject,
    showArchived: queryHook.showArchived,
    setShowArchived: queryHook.setShowArchived,
    sortType: queryHook.sortType,
    setSortType: queryHook.setSortType,
    
    // Pagination state
    currentPage: queryHook.currentPage,
    setCurrentPage: queryHook.setCurrentPage,
    paginationMode: queryHook.paginationMode,
    setPaginationMode: queryHook.setPaginationMode,
    
    // Enhanced operations
    ...operations,
    
    // Enhanced actions
    refreshNotes,
    applyFilters,
    loadMore,
    
    // Error handling
    clearError: stateMachine.actions.clearError,
    retry: stateMachine.retry,
    
    // Debug information
    debug: {
      stateMachineState: stateMachine.state,
      queryState: {
        loading: queryHook.loading,
        error: queryHook.error,
        notesCount: queryHook.notes.length,
      },
      retryCount: stateMachine.retryCount,
    },
  };
};

export default useNotesWithStateMachine;
