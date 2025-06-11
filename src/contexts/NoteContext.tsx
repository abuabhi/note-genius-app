
import React, { createContext, useContext, ReactNode } from 'react';
import { NoteContextType } from './notes/types';
import { useNotesState } from './notes/state/useNotesState';
import { useNotesOperations } from './notes/useNotesOperations';
import { useFetchNotes } from './notes/useFetchNotes';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorState } from '@/components/notes/page/ErrorState';

const NoteContext = createContext<NoteContextType | undefined>(undefined);

// Error fallback component for the context
const NoteContextErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <ErrorState 
    message={`Notes system error: ${error.message}`}
    onRetry={resetErrorBoundary}
  />
);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary
      FallbackComponent={NoteContextErrorFallback}
      onReset={() => window.location.reload()}
    >
      <NoteProviderInner>
        {children}
      </NoteProviderInner>
    </ErrorBoundary>
  );
};

const NoteProviderInner = ({ children }: { children: ReactNode }) => {
  // Get state management from refactored hook
  const notesState = useNotesState();
  
  if (!notesState) {
    throw new Error('Notes state could not be initialized');
  }

  const {
    notes,
    setNotes,
    searchTerm,
    setSearchTerm,
    sortType, 
    setSortType,
    currentPage,
    setCurrentPage,
    notesPerPage,
    setNotesPerPage,
    loading,
    setLoading,
    showArchived,
    setShowArchived,
    filterOptions,
    setFilterOptions,
    filteredNotes,
    paginatedNotes,
    totalPages,
    availableSubjects,
    addSubject,
    resetFilters
  } = notesState;

  // Get CRUD operations
  const notesOperations = useNotesOperations(notes, setNotes, currentPage, setCurrentPage, paginatedNotes);
  
  if (!notesOperations) {
    throw new Error('Notes operations could not be initialized');
  }

  const {
    addNote,
    deleteNote,
    updateNote,
    pinNote,
    archiveNote,
    getAllTags,
    filterByTag
  } = notesOperations;

  // Fetch notes from Supabase on component mount with error handling
  const { error: fetchError, retryManually } = useFetchNotes(setNotes, setLoading);

  // Create a wrapper for filterByTag that uses our setSearchTerm directly
  const handleFilterByTag = (tagName: string) => {
    filterByTag(tagName, setSearchTerm);
  };

  // Get all tags from the notes - memoize to prevent recalculation
  const tags = React.useMemo(() => {
    if (!notes || notes.length === 0) return [];
    
    const tagsSet = new Set<string>();
    const tagsWithDetails: { id: string; name: string; color: string }[] = [];
    
    notes.forEach(note => {
      if (!note.tags) return;
      
      note.tags.forEach(tag => {
        if (!tagsSet.has(tag.name)) {
          tagsSet.add(tag.name);
          tagsWithDetails.push({
            id: tag.id || tag.name,
            name: tag.name,
            color: tag.color
          });
        }
      });
    });
    
    return tagsWithDetails;
  }, [notes]);

  const contextValue: NoteContextType = { 
    notes, 
    filteredNotes, 
    paginatedNotes,
    searchTerm, 
    setSearchTerm, 
    addNote, 
    deleteNote, 
    updateNote,
    pinNote,
    archiveNote,
    sortType,
    setSortType,
    showArchived,
    setShowArchived,
    currentPage,
    setCurrentPage,
    totalPages,
    notesPerPage,
    setNotesPerPage,
    loading,
    getAllTags,
    filterByTag: handleFilterByTag,
    filterOptions,
    setFilterOptions,
    resetFilters,
    availableSubjects,
    addSubject,
    setNotes,
    tags
  };

  return (
    <NoteContext.Provider value={contextValue}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};
