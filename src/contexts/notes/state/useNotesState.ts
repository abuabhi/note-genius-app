
import { useState, useCallback } from 'react';
import { Note } from "@/types/note";
import { FilterOptions } from './types';
import { useFilteredNotes } from './useFilteredNotes';
import { usePaginatedNotes } from './usePaginatedNotes';
import { useCategoriesState } from './useCategoriesState';

/**
 * Main hook for managing notes state with stable updates
 */
export function useNotesState() {
  // Core state
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  
  // Get categories state
  const { availableCategories, addCategory } = useCategoriesState(notes);
  
  // Get filtered notes
  const filteredNotes = useFilteredNotes(
    notes, 
    searchTerm, 
    sortType, 
    filterOptions, 
    showArchived
  );
  
  // Get paginated notes
  const {
    currentPage,
    setCurrentPage,
    notesPerPage,
    setNotesPerPage,
    totalPages,
    paginatedNotes
  } = usePaginatedNotes(filteredNotes);
  
  // Simple state updates without transitions to prevent suspension
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
