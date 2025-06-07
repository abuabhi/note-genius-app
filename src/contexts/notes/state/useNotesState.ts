
import { useState, useCallback } from 'react';
import { Note } from "@/types/note";
import { FilterOptions } from './types';
import { useFilteredNotes } from './useFilteredNotes';
import { usePaginatedNotes } from './usePaginatedNotes';
import { useCategoriesState } from './useCategoriesState';

/**
 * Main hook for managing notes state with stable updates and error handling
 */
export function useNotesState() {
  // Core state with proper initialization
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  
  // Get categories state with error handling
  const categoriesState = useCategoriesState(notes);
  const { availableCategories, addCategory } = categoriesState || { availableCategories: [], addCategory: () => {} };
  
  // Get filtered notes with error handling
  const filteredNotes = useFilteredNotes(
    notes, 
    searchTerm, 
    sortType, 
    filterOptions, 
    showArchived
  ) || [];
  
  // Get paginated notes with error handling
  const paginationState = usePaginatedNotes(filteredNotes);
  const {
    currentPage,
    setCurrentPage,
    notesPerPage,
    setNotesPerPage,
    totalPages,
    paginatedNotes
  } = paginationState || {
    currentPage: 1,
    setCurrentPage: () => {},
    notesPerPage: 10,
    setNotesPerPage: () => {},
    totalPages: 1,
    paginatedNotes: []
  };
  
  // Stable state update functions
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const updateFilterOptions = useCallback((options: FilterOptions) => {
    setFilterOptions(options);
  }, []);

  const updateSortType = useCallback((type: string) => {
    setSortType(type);
  }, []);

  const updateShowArchived = useCallback((show: boolean) => {
    setShowArchived(show);
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilterOptions({});
    setSearchTerm('');
  }, []);

  return {
    // Core state
    notes,
    setNotes,
    searchTerm,
    setSearchTerm: updateSearchTerm,
    sortType,
    setSortType: updateSortType,
    loading,
    setLoading,
    showArchived,
    setShowArchived: updateShowArchived,
    
    // Filter options
    filterOptions,
    setFilterOptions: updateFilterOptions,
    
    // Categories
    availableCategories,
    addCategory,
    
    // Filtered and paginated notes
    filteredNotes,
    paginatedNotes,
    
    // Pagination
    currentPage,
    setCurrentPage,
    notesPerPage,
    setNotesPerPage,
    totalPages,
    
    // Actions
    resetFilters
  };
}
