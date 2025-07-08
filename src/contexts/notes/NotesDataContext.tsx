
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types/note';
import { useNotesDataStateMachine } from '@/hooks/notes/useNotesDataStateMachine';
import { useOptimizedNotesWithQuery } from '@/hooks/useOptimizedNotesWithQuery';
import { notesQueryKeys } from '@/hooks/queries/useNotesQueries';

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
  const queryClient = useQueryClient();

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

  // Enhanced cache synchronization - watch for ALL React Query cache updates from mutations
  React.useEffect(() => {
    console.log('🎯 [CACHE SYNC] Setting up enhanced cache subscription listener');
    
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      console.log('🔍 [CACHE SYNC] Cache event detected:', {
        type: event.type,
        queryKey: event.query.queryKey,
        status: event.query.state.status,
        hasData: !!event.query.state.data
      });

      // Enhanced pattern matching for notes queries - catch ALL notes list queries
      const isNotesQuery = event.query.queryKey[0] === 'notes';
      const isListQuery = event.query.queryKey.includes('list') || 
                         event.query.queryKey.includes('infinite') ||
                         event.query.queryKey.length >= 2; // Catch any notes query with filters
      
      const isSuccessfulUpdate = event.type === 'updated' && 
                                event.query.state.status === 'success' &&
                                event.query.state.data;

      console.log('🔍 [CACHE SYNC] Query analysis:', {
        isNotesQuery,
        isListQuery,
        isSuccessfulUpdate,
        fullQueryKey: event.query.queryKey
      });

      if (isNotesQuery && isListQuery && isSuccessfulUpdate) {
        console.log('🔄 [CACHE SYNC] ✅ MATCHING QUERY FOUND - Syncing to state machine');
        console.log('🔄 [CACHE SYNC] Query key:', event.query.queryKey);
        console.log('🔄 [CACHE SYNC] Event type:', event.type);
        
        const data = event.query.state.data as any;
        console.log('🔄 [CACHE SYNC] Cache data structure:', {
          hasNotes: !!data.notes,
          notesCount: data.notes?.length || 0,
          hasTotalCount: !!data.totalCount,
          totalCount: data.totalCount,
          hasMore: data.hasMore
        });
        
        // Immediately sync cache data to state machine for instant UI updates
        dataStateMachine.actions.fetchSuccess(
          data.notes || [],
          data.totalCount || 0,
          data.hasMore || false
        );
        
        console.log('🔄 [CACHE SYNC] ✅ State machine updated with fresh cache data');
      } else {
        console.log('🔄 [CACHE SYNC] ❌ Query ignored - no match');
      }
    });

    return () => {
      console.log('🎯 [CACHE SYNC] Cleaning up cache subscription listener');
      unsubscribe();
    };
  }, [queryClient, dataStateMachine.actions]);

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
