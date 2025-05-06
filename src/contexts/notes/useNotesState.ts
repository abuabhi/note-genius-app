
import { useState, useMemo } from 'react';
import { Note } from "@/types/note";
import { SortType, FilterOptions } from "./types";
import { filterNotes, sortNotes, paginateNotes, getUniqueCategories } from './noteUtils';

export function useNotesState() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [notesPerPage, setNotesPerPage] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(true);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  
  // Get unique categories from notes
  const availableCategories = useMemo(() => {
    return getUniqueCategories(notes);
  }, [notes]);

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({});
  };

  // Filter notes based on search term, filters, and archived status
  const filteredNotes = useMemo(() => {
    const filtered = filterNotes(notes, searchTerm, filterOptions);
    return filtered.filter(note => showArchived ? note.archived : !note.archived);
  }, [notes, searchTerm, filterOptions, showArchived]);

  // Sort the filtered notes, with pinned notes first if not archived
  const sortedNotes = useMemo(() => {
    const sorted = sortNotes(filteredNotes, sortType);
    if (!showArchived) {
      // Put pinned notes at the top
      return [...sorted.filter(note => note.pinned), ...sorted.filter(note => !note.pinned)];
    }
    return sorted;
  }, [filteredNotes, sortType, showArchived]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedNotes.length / notesPerPage);

  // Get current notes for the page
  const paginatedNotes = useMemo(() => {
    return paginateNotes(sortedNotes, currentPage, notesPerPage);
  }, [sortedNotes, currentPage, notesPerPage]);

  return {
    // State variables
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
    
    // Computed values
    filteredNotes: sortedNotes,
    paginatedNotes,
    totalPages,
    availableCategories,
    
    // Actions
    resetFilters
  };
}
