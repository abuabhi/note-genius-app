
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { NotesProvider, useNotes } from './notes/NotesProvider';

interface OptimizedNotesContextType {
  // Core data
  notes: Note[];
  filteredNotes: Note[]; // For compatibility
  paginatedNotes: Note[]; // For compatibility
  totalCount: number;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  isInitialLoading: boolean; // From state machine
  error: string | null;
  
  // Pagination
  hasMore: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loadMore: () => void;
  
  // Additional properties for compatibility
  refetch: () => void;
  
  // Enhanced search and filtering with state machine
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  isFiltering: boolean;
  filterError: string | null;
  
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

// Inner component that consumes the consolidated context and provides backward compatibility
const OptimizedNotesProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const notesContext = useNotes();

  // Memoized context value that provides the exact same interface as before
  const contextValue = useMemo(() => ({
    // All properties are already available from the consolidated hook
    ...notesContext,
  }), [notesContext]);

  return (
    <OptimizedNotesContext.Provider value={contextValue}>
      {children}
    </OptimizedNotesContext.Provider>
  );
});

OptimizedNotesProviderInner.displayName = 'OptimizedNotesProviderInner';

// Main provider that wraps everything
export const OptimizedNotesProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotesProvider>
      <OptimizedNotesProviderInner>
        {children}
      </OptimizedNotesProviderInner>
    </NotesProvider>
  );
};

export const useOptimizedNotes = () => {
  const context = useContext(OptimizedNotesContext);
  if (context === undefined) {
    throw new Error('useOptimizedNotes must be used within an OptimizedNotesProvider');
  }
  return context;
};
