
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotesWithQuery } from '@/hooks/useOptimizedNotesWithQuery';

interface OptimizedNotesContextType {
  // Core data
  notes: Note[];
  filteredNotes: Note[]; // For compatibility
  paginatedNotes: Note[]; // For compatibility
  totalCount: number;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  error: string | null;
  
  // Pagination
  hasMore: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loadMore: () => void;
  
  // Additional properties for compatibility
  refetch: () => void;
  
  // Search and filtering
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  
  // Legacy pagination (for compatibility)
  totalPages: number;
  
  // Operations
  refreshNotes: () => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  pinNote: (id: string, pinned: boolean) => Promise<void>;
  archiveNote: (id: string, archived: boolean) => Promise<void>;
  
  // New React Query enhanced features
  paginationMode: 'regular' | 'infinite';
  setPaginationMode: (mode: 'regular' | 'infinite') => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPinning: boolean;
}

const OptimizedNotesContext = createContext<OptimizedNotesContextType | undefined>(undefined);

const OptimizedNotesProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const queryHook = useOptimizedNotesWithQuery();

  // Memoized context value with React Query integration
  const contextValue = useMemo(() => ({
    // Core data
    notes: queryHook.notes,
    filteredNotes: queryHook.notes, // Same as notes since filtering is server-side
    paginatedNotes: queryHook.notes, // Same as notes since pagination is server-side
    totalCount: queryHook.totalCount,
    loading: queryHook.loading,
    isLoading: queryHook.loading,
    error: queryHook.error,
    
    // Pagination
    hasMore: queryHook.hasMore,
    currentPage: queryHook.currentPage,
    setCurrentPage: queryHook.setCurrentPage,
    loadMore: queryHook.loadMore,
    
    // Additional properties for compatibility
    refetch: queryHook.refreshNotes,
    
    // Search and filtering
    searchTerm: queryHook.searchTerm,
    setSearchTerm: queryHook.setSearchTerm,
    sortType: queryHook.sortType,
    setSortType: queryHook.setSortType,
    showArchived: queryHook.showArchived,
    setShowArchived: queryHook.setShowArchived,
    selectedSubject: queryHook.selectedSubject,
    setSelectedSubject: queryHook.setSelectedSubject,
    
    // Legacy pagination (for compatibility)
    totalPages: Math.ceil(queryHook.totalCount / 20),
    
    // Operations
    refreshNotes: queryHook.refreshNotes,
    addNote: queryHook.addNote,
    updateNote: queryHook.updateNote,
    deleteNote: queryHook.deleteNote,
    pinNote: queryHook.pinNote,
    archiveNote: async (id: string, archived: boolean) => {
      await queryHook.updateNote(id, { archived });
    },
    
    // New React Query enhanced features
    paginationMode: queryHook.paginationMode,
    setPaginationMode: queryHook.setPaginationMode,
    isCreating: queryHook.isCreating,
    isUpdating: queryHook.isUpdating,
    isDeleting: queryHook.isDeleting,
    isPinning: queryHook.isPinning,
  }), [queryHook]);

  return (
    <OptimizedNotesContext.Provider value={contextValue}>
      {children}
    </OptimizedNotesContext.Provider>
  );
});

OptimizedNotesProviderInner.displayName = 'OptimizedNotesProviderInner';

export const OptimizedNotesProvider = ({ children }: { children: ReactNode }) => {
  return (
    <OptimizedNotesProviderInner>
      {children}
    </OptimizedNotesProviderInner>
  );
};

export const useOptimizedNotes = () => {
  const context = useContext(OptimizedNotesContext);
  if (context === undefined) {
    throw new Error('useOptimizedNotes must be used within an OptimizedNotesProvider');
  }
  return context;
};
