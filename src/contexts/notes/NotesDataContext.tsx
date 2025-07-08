
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useNotesDataStateMachine } from '@/hooks/notes/useNotesDataStateMachine';
import { useOptimizedNotesWithQuery } from '@/hooks/useOptimizedNotesWithQuery';

interface NotesDataContextType {
  // Core data
  notes: Note[];
  totalCount: number;
  error: string | null;
  
  // Simplified loading states
  loading: boolean;
  isInitialLoading: boolean;
  
  // Pagination
  hasMore: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loadMore: () => void;
  
  // Pagination mode
  paginationMode: 'regular' | 'infinite';
  setPaginationMode: (mode: 'regular' | 'infinite') => void;
  
  // Actions
  refreshNotes: () => void;
  
  // Data state
  hasNotes: boolean;
  isEmpty: boolean;
  
  // State for debugging
  state: string;
}

const NotesDataContext = createContext<NotesDataContextType | undefined>(undefined);

const NotesDataProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const dataStateMachine = useNotesDataStateMachine();
  const queryHook = useOptimizedNotesWithQuery();

  // Direct synchronization - no complex state machine logic
  React.useEffect(() => {
    if (queryHook.loading) {
      dataStateMachine.actions.startLoading();
    } else if (queryHook.error) {
      dataStateMachine.actions.fetchError(queryHook.error);
    } else {
      dataStateMachine.actions.fetchSuccess(
        queryHook.notes,
        queryHook.totalCount,
        queryHook.hasMore
      );
    }
  }, [queryHook.loading, queryHook.error, queryHook.notes, queryHook.totalCount, queryHook.hasMore]);

  // Simplified load more function
  const loadMore = React.useCallback(() => {
    if (dataStateMachine.hasMore && !dataStateMachine.isLoading) {
      queryHook.loadMore();
    }
  }, [dataStateMachine.hasMore, dataStateMachine.isLoading, queryHook.loadMore]);

  // Simplified refresh function
  const refreshNotes = React.useCallback(() => {
    queryHook.refreshNotes();
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

  // Simplified context value
  const contextValue = useMemo(() => ({
    // Core data
    notes: dataStateMachine.notes,
    totalCount: dataStateMachine.totalCount,
    error: dataStateMachine.error,
    
    // Simplified loading states
    loading: dataStateMachine.isLoading,
    isInitialLoading: dataStateMachine.isLoading,
    
    // Pagination
    hasMore: dataStateMachine.hasMore,
    currentPage: dataStateMachine.currentPage,
    setCurrentPage,
    loadMore,
    
    // Pagination mode
    paginationMode: dataStateMachine.paginationMode,
    setPaginationMode,
    
    // Actions
    refreshNotes,
    
    // Data state
    hasNotes: dataStateMachine.hasNotes,
    isEmpty: dataStateMachine.isEmpty,
    
    // State for debugging
    state: dataStateMachine.state,
  }), [
    dataStateMachine.notes,
    dataStateMachine.totalCount,
    dataStateMachine.error,
    dataStateMachine.isLoading,
    dataStateMachine.hasMore,
    dataStateMachine.currentPage,
    setCurrentPage,
    loadMore,
    dataStateMachine.paginationMode,
    setPaginationMode,
    refreshNotes,
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
