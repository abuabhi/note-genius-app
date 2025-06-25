
import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes as useOptimizedNotesHook } from '@/hooks/useOptimizedNotes';
import { useNotesOperations } from './notes/useNotesOperations';

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
}

const OptimizedNotesContext = createContext<OptimizedNotesContextType | undefined>(undefined);

const OptimizedNotesProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const optimizedNotes = useOptimizedNotesHook();
  
  // Get operations
  const operations = useNotesOperations(
    optimizedNotes.notes, 
    optimizedNotes.setNotes, 
    optimizedNotes.currentPage, 
    optimizedNotes.setCurrentPage, 
    optimizedNotes.notes // Use all notes since we're paginating at source
  );

  // Memoized context value
  const contextValue = useMemo(() => ({
    // Core data
    notes: optimizedNotes.notes,
    filteredNotes: optimizedNotes.notes, // Same as notes since filtering is server-side
    paginatedNotes: optimizedNotes.notes, // Same as notes since pagination is server-side
    totalCount: optimizedNotes.totalCount,
    loading: optimizedNotes.loading,
    isLoading: optimizedNotes.loading,
    error: optimizedNotes.error,
    
    // Pagination
    hasMore: optimizedNotes.hasMore,
    currentPage: optimizedNotes.currentPage,
    setCurrentPage: optimizedNotes.setCurrentPage,
    loadMore: optimizedNotes.loadMore,
    
    // Additional properties for compatibility
    refetch: optimizedNotes.refreshNotes,
    
    // Search and filtering
    searchTerm: optimizedNotes.searchTerm,
    setSearchTerm: optimizedNotes.setSearchTerm,
    sortType: optimizedNotes.sortType,
    setSortType: optimizedNotes.setSortType,
    showArchived: optimizedNotes.showArchived,
    setShowArchived: optimizedNotes.setShowArchived,
    selectedSubject: optimizedNotes.selectedSubject,
    setSelectedSubject: optimizedNotes.setSelectedSubject,
    
    // Legacy pagination (for compatibility)
    totalPages: Math.ceil(optimizedNotes.totalCount / 20),
    
    // Operations
    refreshNotes: optimizedNotes.refreshNotes,
    addNote: operations.addNote,
    updateNote: operations.updateNote,
    deleteNote: operations.deleteNote,
    pinNote: operations.pinNote,
    archiveNote: operations.archiveNote
  }), [optimizedNotes, operations]);

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
