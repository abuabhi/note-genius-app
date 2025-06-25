
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotesWithQuery } from '@/hooks/useOptimizedNotesWithQuery';

interface NotesDataContextType {
  // Core data
  notes: Note[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  
  // Pagination
  hasMore: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loadMore: () => void;
  
  // Pagination mode
  paginationMode: 'regular' | 'infinite';
  setPaginationMode: (mode: 'regular' | 'infinite') => void;
  
  // Data refresh
  refreshNotes: () => void;
}

const NotesDataContext = createContext<NotesDataContextType | undefined>(undefined);

const NotesDataProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const queryHook = useOptimizedNotesWithQuery();

  // Memoized context value focused only on data concerns
  const contextValue = useMemo(() => ({
    // Core data
    notes: queryHook.notes,
    totalCount: queryHook.totalCount,
    loading: queryHook.loading,
    error: queryHook.error,
    
    // Pagination
    hasMore: queryHook.hasMore,
    currentPage: queryHook.currentPage,
    setCurrentPage: queryHook.setCurrentPage,
    loadMore: queryHook.loadMore,
    
    // Pagination mode
    paginationMode: queryHook.paginationMode,
    setPaginationMode: queryHook.setPaginationMode,
    
    // Data refresh
    refreshNotes: queryHook.refreshNotes,
  }), [
    queryHook.notes,
    queryHook.totalCount,
    queryHook.loading,
    queryHook.error,
    queryHook.hasMore,
    queryHook.currentPage,
    queryHook.setCurrentPage,
    queryHook.loadMore,
    queryHook.paginationMode,
    queryHook.setPaginationMode,
    queryHook.refreshNotes,
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
