
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useNotesDataStateMachine } from '@/hooks/notes/useNotesDataStateMachine';
import { useOptimizedNotesWithQuery } from '@/hooks/useOptimizedNotesWithQuery';

interface NotesDataContextType {
  // Core data from state machine
  notes: Note[];
  totalCount: number;
  error: string | null;
  
  // Enhanced loading states from state machine
  loading: boolean;
  isInitialLoading: boolean;
  isBackgroundLoading: boolean;
  isRefreshing: boolean;
  isFiltering: boolean;
  isPaginating: boolean;
  
  // Pagination from state machine
  hasMore: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loadMore: () => void;
  
  // Pagination mode from state machine
  paginationMode: 'regular' | 'infinite';
  setPaginationMode: (mode: 'regular' | 'infinite') => void;
  
  // Data refresh with enhanced error handling
  refreshNotes: () => void;
  
  // Error handling from state machine
  hasError: boolean;
  canRetry: boolean;
  clearError: () => void;
  retry: () => void;
  
  // Data state selectors from state machine
  hasNotes: boolean;
  isEmpty: boolean;
  
  // State machine state for debugging
  state: string;
}

const NotesDataContext = createContext<NotesDataContextType | undefined>(undefined);

const NotesDataProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const dataStateMachine = useNotesDataStateMachine();
  const queryHook = useOptimizedNotesWithQuery();

  // Sync query hook state with data state machine
  React.useEffect(() => {
    if (queryHook.loading && dataStateMachine.isIdle) {
      // Determine the type of loading based on current state
      if (dataStateMachine.notes.length === 0) {
        dataStateMachine.actions.startInitialLoad();
      } else {
        dataStateMachine.actions.startBackgroundLoad();
      }
    }
  }, [queryHook.loading, dataStateMachine.isIdle, dataStateMachine.notes.length]);

  React.useEffect(() => {
    if (!queryHook.loading && queryHook.notes.length >= 0) {
      dataStateMachine.actions.fetchSuccess(
        queryHook.notes,
        queryHook.totalCount,
        queryHook.hasMore,
        false // For now, we don't append - this would be handled by pagination logic
      );
    }
  }, [queryHook.loading, queryHook.notes, queryHook.totalCount, queryHook.hasMore]);

  React.useEffect(() => {
    if (queryHook.error) {
      dataStateMachine.actions.fetchError(queryHook.error);
    }
  }, [queryHook.error]);

  // Enhanced load more function
  const loadMore = React.useCallback(async () => {
    if (dataStateMachine.hasMore && !dataStateMachine.loading) {
      dataStateMachine.actions.startPaginate();
      try {
        await queryHook.loadMore();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load more notes';
        dataStateMachine.actions.fetchError(errorMessage);
      }
    }
  }, [dataStateMachine.hasMore, dataStateMachine.loading, queryHook.loadMore]);

  // Enhanced refresh function
  const refreshNotes = React.useCallback(async () => {
    dataStateMachine.actions.startRefresh();
    try {
      await queryHook.refreshNotes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh notes';
      dataStateMachine.actions.fetchError(errorMessage);
    }
  }, [queryHook.refreshNotes]);

  // Enhanced page change
  const setCurrentPage = React.useCallback((page: number) => {
    dataStateMachine.actions.setPage(page);
    queryHook.setCurrentPage(page);
  }, [queryHook.setCurrentPage]);

  // Enhanced pagination mode change
  const setPaginationMode = React.useCallback((mode: 'regular' | 'infinite') => {
    dataStateMachine.actions.setPaginationMode(mode);
    queryHook.setPaginationMode(mode);
  }, [queryHook.setPaginationMode]);

  // Memoized context value that uses state machine for enhanced data management
  const contextValue = useMemo(() => ({
    // Core data from state machine
    notes: dataStateMachine.notes,
    totalCount: dataStateMachine.totalCount,
    error: dataStateMachine.error,
    
    // Enhanced loading states from state machine
    loading: dataStateMachine.loading,
    isInitialLoading: dataStateMachine.isInitialLoading,
    isBackgroundLoading: dataStateMachine.isBackgroundLoading,
    isRefreshing: dataStateMachine.isRefreshing,
    isFiltering: dataStateMachine.isFiltering,
    isPaginating: dataStateMachine.isPaginating,
    
    // Pagination from state machine
    hasMore: dataStateMachine.hasMore,
    currentPage: dataStateMachine.currentPage,
    setCurrentPage,
    loadMore,
    
    // Pagination mode from state machine
    paginationMode: dataStateMachine.paginationMode,
    setPaginationMode,
    
    // Data refresh with enhanced error handling
    refreshNotes,
    
    // Error handling from state machine
    hasError: dataStateMachine.hasError,
    canRetry: dataStateMachine.canRetry,
    clearError: dataStateMachine.actions.clearError,
    retry: dataStateMachine.retry,
    
    // Data state selectors from state machine
    hasNotes: dataStateMachine.hasNotes,
    isEmpty: dataStateMachine.isEmpty,
    
    // State machine state for debugging
    state: dataStateMachine.state,
  }), [
    dataStateMachine.notes,
    dataStateMachine.totalCount,
    dataStateMachine.error,
    dataStateMachine.loading,
    dataStateMachine.isInitialLoading,
    dataStateMachine.isBackgroundLoading,
    dataStateMachine.isRefreshing,
    dataStateMachine.isFiltering,
    dataStateMachine.isPaginating,
    dataStateMachine.hasMore,
    dataStateMachine.currentPage,
    setCurrentPage,
    loadMore,
    dataStateMachine.paginationMode,
    setPaginationMode,
    refreshNotes,
    dataStateMachine.hasError,
    dataStateMachine.canRetry,
    dataStateMachine.actions.clearError,
    dataStateMachine.retry,
    dataStateMachine.hasNotes,
    dataStateMachine.isEmpty,
    dataStateMachine.state,
  ]);

  return (
    <NotesDataContext.Provider value={contextValue}>
      {children}
    </NotesDataContext.Provider>
  );
});

NotesDataProviderInner.displayName = 'NotesDataProviderInner';

export const NotesDataProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotesDataProviderInner>
      {children}
    </NotesDataProviderInner>
  );
};

export const useNotesData = () => {
  const context = useContext(NotesDataContext);
  if (context === undefined) {
    throw new Error('useNotesData must be used within a NotesDataProvider');
  }
  return context;
};
