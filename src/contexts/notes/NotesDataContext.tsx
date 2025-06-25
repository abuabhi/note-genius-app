
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useNotesWithStateMachine } from '@/hooks/notes/useNotesWithStateMachine';

interface NotesDataContextType {
  // Core data
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
  
  // Pagination
  hasMore: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loadMore: () => void;
  
  // Pagination mode
  paginationMode: 'regular' | 'infinite';
  setPaginationMode: (mode: 'regular' | 'infinite') => void;
  
  // Data refresh with enhanced error handling
  refreshNotes: () => void;
  
  // Error handling from state machine
  hasError: boolean;
  canRetry: boolean;
  clearError: () => void;
  retry: () => void;
  
  // Data state selectors
  hasNotes: boolean;
  isEmpty: boolean;
  
  // State machine state for debugging
  state: string;
}

const NotesDataContext = createContext<NotesDataContextType | undefined>(undefined);

const NotesDataProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const stateMachineHook = useNotesWithStateMachine();

  // Memoized context value focused only on data concerns with state machine enhancements
  const contextValue = useMemo(() => ({
    // Core data
    notes: stateMachineHook.notes,
    totalCount: stateMachineHook.totalCount,
    error: stateMachineHook.error,
    
    // Enhanced loading states from state machine
    loading: stateMachineHook.loading,
    isInitialLoading: stateMachineHook.isInitialLoading,
    isBackgroundLoading: stateMachineHook.isBackgroundLoading,
    isRefreshing: stateMachineHook.isRefreshing,
    isFiltering: stateMachineHook.isFiltering,
    isPaginating: stateMachineHook.isPaginating,
    
    // Pagination
    hasMore: stateMachineHook.hasMore,
    currentPage: stateMachineHook.currentPage,
    setCurrentPage: stateMachineHook.setCurrentPage,
    loadMore: stateMachineHook.loadMore,
    
    // Pagination mode
    paginationMode: stateMachineHook.paginationMode,
    setPaginationMode: stateMachineHook.setPaginationMode,
    
    // Data refresh with enhanced error handling
    refreshNotes: stateMachineHook.refreshNotes,
    
    // Error handling from state machine
    hasError: stateMachineHook.hasError,
    canRetry: stateMachineHook.canRetry,
    clearError: stateMachineHook.clearError,
    retry: stateMachineHook.retry,
    
    // Data state selectors
    hasNotes: stateMachineHook.hasNotes,
    isEmpty: stateMachineHook.isEmpty,
    
    // State machine state for debugging
    state: stateMachineHook.state,
  }), [
    stateMachineHook.notes,
    stateMachineHook.totalCount,
    stateMachineHook.error,
    stateMachineHook.loading,
    stateMachineHook.isInitialLoading,
    stateMachineHook.isBackgroundLoading,
    stateMachineHook.isRefreshing,
    stateMachineHook.isFiltering,
    stateMachineHook.isPaginating,
    stateMachineHook.hasMore,
    stateMachineHook.currentPage,
    stateMachineHook.setCurrentPage,
    stateMachineHook.loadMore,
    stateMachineHook.paginationMode,
    stateMachineHook.setPaginationMode,
    stateMachineHook.refreshNotes,
    stateMachineHook.hasError,
    stateMachineHook.canRetry,
    stateMachineHook.clearError,
    stateMachineHook.retry,
    stateMachineHook.hasNotes,
    stateMachineHook.isEmpty,
    stateMachineHook.state,
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
