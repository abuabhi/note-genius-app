
import React, { createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes as useOptimizedNotesHook } from '@/hooks/useOptimizedNotes';
import { useNotesOperations } from './notes/useNotesOperations';
import { useFilteredNotes } from './notes/state/useFilteredNotes';
import { usePaginatedNotes } from './notes/state/usePaginatedNotes';
import { useState } from 'react';

interface OptimizedNotesContextType {
  // Core data
  notes: Note[];
  filteredNotes: Note[];
  paginatedNotes: Note[];
  totalCount: number;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  error: string | null;
  
  // Additional properties for compatibility
  hasMore: boolean;
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
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
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

// Simplified provider component without heavy features
const OptimizedNotesProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const { notes, loading, error, refreshNotes, setNotes } = useOptimizedNotesHook();
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // Simple search function instead of advanced indexing
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.description.toLowerCase().includes(searchLower) ||
        (note.content || '').toLowerCase().includes(searchLower) ||
        note.subject.toLowerCase().includes(searchLower)
      );
    }

    // Apply subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(note => note.subject === selectedSubject);
    }

    // Apply archived filter
    if (!showArchived) {
      filtered = filtered.filter(note => !note.archived);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
        case 'oldest':
          return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });
  }, [notes, searchTerm, selectedSubject, showArchived, sortType]);
  
  // Get pagination
  const paginationState = usePaginatedNotes(filteredNotes);
  const { currentPage, setCurrentPage, totalPages, paginatedNotes } = paginationState || {
    currentPage: 1,
    setCurrentPage: () => {},
    totalPages: 1,
    paginatedNotes: []
  };

  // Get operations - simplified without real-time features
  const operations = useNotesOperations(
    notes, 
    setNotes, 
    currentPage, 
    setCurrentPage, 
    paginatedNotes
  );

  // Memoized context value
  const contextValue = useMemo(() => ({
    // Core data
    notes,
    filteredNotes,
    paginatedNotes,
    totalCount: notes.length,
    loading,
    isLoading: loading, // Alias for compatibility
    error,
    
    // Additional properties for compatibility
    hasMore: false,
    refetch: refreshNotes,
    
    // Search and filtering
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    showArchived,
    setShowArchived,
    selectedSubject,
    setSelectedSubject,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Operations
    refreshNotes,
    addNote: operations.addNote,
    updateNote: operations.updateNote,
    deleteNote: operations.deleteNote,
    pinNote: operations.pinNote,
    archiveNote: operations.archiveNote
  }), [
    notes, filteredNotes, paginatedNotes, loading, error,
    searchTerm, sortType, showArchived, selectedSubject, currentPage, totalPages,
    refreshNotes, operations.addNote, operations.updateNote, operations.deleteNote,
    operations.pinNote, operations.archiveNote
  ]);

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
