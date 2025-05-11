
import { Note } from "@/types/note";
import { FilterOptions, SortType } from "./types";

/**
 * Checks if a note matches the given search term
 */
export const matchesSearchTerm = (note: Note, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return note.title.toLowerCase().includes(lowerSearchTerm) || 
    note.description.toLowerCase().includes(lowerSearchTerm) || 
    note.category.toLowerCase().includes(lowerSearchTerm) ||
    (note.content && note.content.toLowerCase().includes(lowerSearchTerm)) ||
    (note.tags && note.tags.some(tag => tag.name.toLowerCase().includes(lowerSearchTerm)));
};

/**
 * Filter notes based on search term and filter options
 */
export const filterNotes = (notes: Note[], searchTerm: string, filterOptions: FilterOptions, showArchived: boolean): Note[] => {
  return notes.filter(note => {
    // Filter by archived status
    if (!showArchived && note.archived) {
      return false;
    }
    
    // Search by title, description, content
    if (searchTerm && !matchesSearchTerm(note, searchTerm)) {
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
    
    // Filter by subject ID (for subject tabs)
    if (filterOptions.subjectId && note.subject_id) {
      console.log(`Comparing note subject_id: ${note.subject_id} with filter: ${filterOptions.subjectId}`);
      if (note.subject_id !== filterOptions.subjectId) {
        return false;
      }
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
    
    // Filter by hasTags (if specified)
    if (filterOptions.hasTags === true && (!note.tags || note.tags.length === 0)) {
      return false;
    }
    
    if (filterOptions.hasTags === false && note.tags && note.tags.length > 0) {
      return false;
    }
    
    return true;
  });
};

/**
 * Sort notes based on sort type
 */
export const sortNotes = (notes: Note[], sortType: SortType): Note[] => {
  return [...notes].sort((a, b) => {
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
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });
};

/**
 * Paginate notes based on current page and notes per page
 */
export const paginateNotes = (notes: Note[], currentPage: number, notesPerPage: number): Note[] => {
  const startIndex = (currentPage - 1) * notesPerPage;
  return notes.slice(startIndex, startIndex + notesPerPage);
};

/**
 * Extract unique categories from notes
 */
export const extractCategories = (notes: Note[]): string[] => {
  if (!notes.length) return [];
  
  return notes
    .map(note => note.category)
    .filter((category, index, self) => 
      // Remove empty categories and duplicates
      category && category.trim() !== '' && 
      self.indexOf(category) === index
    )
    .sort();
};
