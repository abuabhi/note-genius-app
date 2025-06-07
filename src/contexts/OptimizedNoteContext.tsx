
import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/hooks/useOptimizedNotes';
import { useNotesOperations } from './notes/useNotesOperations';
import { useFilteredNotes } from './notes/state/useFilteredNotes';
import { usePaginatedNotes } from './notes/state/usePaginatedNotes';
import { useState } from 'react';

interface OptimizedNoteContextType {
  notes: Note[];
  filteredNotes: Note[];
  paginatedNotes: Note[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  refreshNotes: () => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  pinNote: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
}

const OptimizedNoteContext = createContext<OptimizedNoteContextType | undefined>(undefined);

// Memoized provider component
const OptimizedNoteProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const { notes, loading, error, refreshNotes, setNotes } = useOptimizedNotes();
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  
  // Get filtered notes
  const filteredNotes = useFilteredNotes(notes, searchTerm, sortType, {}, showArchived) || [];
  
  // Get pagination
  const paginationState = usePaginatedNotes(filteredNotes);
  const { currentPage, setCurrentPage, totalPages, paginatedNotes } = paginationState || {
    currentPage: 1,
    setCurrentPage: () => {},
    totalPages: 1,
    paginatedNotes: []
  };

  // Get operations
  const operations = useNotesOperations(
    notes, 
    setNotes, 
    currentPage, 
    setCurrentPage, 
    paginatedNotes
  );

  // Memoized context value
  const contextValue = useMemo(() => ({
    notes,
    filteredNotes,
    paginatedNotes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    showArchived,
    setShowArchived,
    currentPage,
    setCurrentPage,
    totalPages,
    refreshNotes,
    addNote: operations.addNote,
    updateNote: operations.updateNote,
    deleteNote: operations.deleteNote,
    pinNote: operations.pinNote,
    archiveNote: operations.archiveNote
  }), [
    notes, filteredNotes, paginatedNotes, loading, error,
    searchTerm, sortType, showArchived, currentPage, totalPages,
    refreshNotes, operations
  ]);

  return (
    <OptimizedNoteContext.Provider value={contextValue}>
      {children}
    </OptimizedNoteContext.Provider>
  );
});

OptimizedNoteProviderInner.displayName = 'OptimizedNoteProviderInner';

export const OptimizedNoteProvider = ({ children }: { children: ReactNode }) => {
  return (
    <OptimizedNoteProviderInner>
      {children}
    </OptimizedNoteProviderInner>
  );
};

export const useOptimizedNotesContext = () => {
  const context = useContext(OptimizedNoteContext);
  if (context === undefined) {
    throw new Error('useOptimizedNotesContext must be used within an OptimizedNoteProvider');
  }
  return context;
};
