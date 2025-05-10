
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Note } from "@/types/note";
import { FilterOptions } from './types';
import { noteUtils } from './noteUtils';

export function useNotesState() {
  // Core state
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [notesPerPage, setNotesPerPage] = useState(12);

  // Loading state
  const [loading, setLoading] = useState(true);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  
  // Categories
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Extract unique categories from notes
  useEffect(() => {
    if (!notes.length) return;
    
    const categories = notes
      .map(note => note.category)
      .filter((category, index, self) => 
        // Remove empty categories and duplicates
        category && category.trim() !== '' && 
        self.indexOf(category) === index
      )
      .sort();
    
    setAvailableCategories(prevCategories => {
      const allCategories = [...new Set([...prevCategories, ...categories])];
      return allCategories.filter(cat => cat && cat.trim() !== '');
    });
  }, [notes]);

  // Apply filters and search
  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        // Filter by archived status
        if (!showArchived && note.archived) {
          return false;
        }
        
        // Search by title, description, content
        if (searchTerm && !noteUtils.matchesSearchTerm(note, searchTerm)) {
          return false;
        }
        
        // Filter by date range
        if (filterOptions.dateFrom || filterOptions.dateTo) {
          const noteDate = new Date(note.date);
          
          if (filterOptions.dateFrom && noteDate < filterOptions.dateFrom) {
            return false;
          }
          
          if (filterOptions.dateTo) {
            // Include the end date by setting time to the end of the day
            const endDate = new Date(filterOptions.dateTo);
            endDate.setHours(23, 59, 59, 999);
            
            if (noteDate > endDate) {
              return false;
            }
          }
        }
        
        // Filter by category
        if (filterOptions.category && note.category !== filterOptions.category) {
          return false;
        }
        
        // Filter by source type
        if (filterOptions.sourceType) {
          if (Array.isArray(filterOptions.sourceType)) {
            if (!filterOptions.sourceType.includes(note.sourceType || 'manual')) {
              return false;
            }
          } else if (note.sourceType !== filterOptions.sourceType) {
            return false;
          }
        }
        
        // Filter by tags
        if (filterOptions.tags && filterOptions.tags.length > 0) {
          // If note has no tags, filter it out
          if (!note.tags || note.tags.length === 0) {
            return false;
          }
          
          // Check if any of the note's tags match the filter
          const hasMatchingTag = note.tags.some(tag => 
            filterOptions.tags?.includes(tag.name)
          );
          
          if (!hasMatchingTag) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        // Pinned notes always go first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        
        // Then apply the chosen sort
        switch (sortType) {
          case 'newest':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'oldest':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [notes, searchTerm, sortType, showArchived, filterOptions]);
  
  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / notesPerPage));
  
  // Adjust current page if it exceeds the new total
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);
  
  // Get current page of notes
  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * notesPerPage;
    return filteredNotes.slice(startIndex, startIndex + notesPerPage);
  }, [filteredNotes, currentPage, notesPerPage]);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    setFilterOptions({});
    setSearchTerm('');
  }, []);

  return {
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
  };
}
