
import React, { createContext, useContext, ReactNode } from 'react';
import { NoteContextType } from './notes/types';
import { useNotesState } from './notes/state/useNotesState';
import { useNotesOperations } from './notes/useNotesOperations';
import { useFetchNotes } from './notes/useFetchNotes';

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  // Get state management from refactored hook
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
    availableCategories,
    addCategory,
    resetFilters
  } = useNotesState();

  // Get CRUD operations
  const {
    addNote,
    deleteNote,
    updateNote,
    pinNote,
    archiveNote,
    getAllTags,
    filterByTag
  } = useNotesOperations(notes, setNotes, currentPage, setCurrentPage, paginatedNotes);

  // Fetch notes from Supabase on component mount
  useFetchNotes(setNotes, setLoading);

  // Create a wrapper for filterByTag that uses our setSearchTerm directly
  const handleFilterByTag = (tagName: string) => {
    filterByTag(tagName, setSearchTerm);
  };

  return (
    <NoteContext.Provider value={{ 
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
      availableCategories,
      addCategory,
      setNotes  // Include setNotes in the context value
    }}>
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
