
import React, { createContext, useContext, ReactNode } from 'react';
import { NoteContextType } from './notes/types';
import { useNotesState } from './notes/useNotesState';
import { useNotesOperations } from './notes/useNotesOperations';
import { useFetchNotes } from './notes/useFetchNotes';

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  // Get state management
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
    setAvailableCategories,
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

  // Add a category to availableCategories
  const addCategory = (category: string) => {
    if (!category || category.trim() === '') return;
    
    // Check if category already exists
    if (availableCategories.includes(category.trim())) return;
    
    // Add the new category
    setAvailableCategories(prev => [...prev, category.trim()]);
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
      addCategory
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
