
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { FilterOptions, SortType } from "./types";

export const fetchNotesFromSupabase = async (): Promise<Note[]> => {
  try {
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select(`
        *,
        tags:note_tags(
          tag:tags(id, name, color)
        ),
        scanData:scan_data(*)
      `)
      .order('created_at', { ascending: false });

    if (notesError) {
      throw notesError;
    }

    // Transform the data into the Note format
    const notes: Note[] = notesData.map((note) => {
      // Extract tags from the nested structure
      const tags = note.tags
        ? note.tags
            .filter((tagObj: any) => tagObj.tag)
            .map((tagObj: any) => ({
              id: tagObj.tag.id,
              name: tagObj.tag.name,
              color: tagObj.tag.color
            }))
        : [];

      // Extract scan data if present
      const scanData = note.scanData && note.scanData.length > 0
        ? {
            originalImageUrl: note.scanData[0].original_image_url,
            recognizedText: note.scanData[0].recognized_text,
            confidence: note.scanData[0].confidence,
            language: note.scanData[0].language
          }
        : undefined;

      // Return the formatted note
      return {
        id: note.id,
        title: note.title,
        description: note.description,
        date: new Date(note.date).toISOString().split('T')[0],
        category: note.subject, // Map from subject column to category field
        content: note.content,
        sourceType: note.source_type as 'manual' | 'scan' | 'import',
        archived: note.archived || false,
        pinned: note.pinned || false,
        tags,
        scanData,
        subject_id: note.subject_id  // Add subject_id field
      };
    });

    return notes;
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

const filterNotes = (notes: Note[], searchTerm: string, filterOptions: FilterOptions = {}): Note[] => {
  if (!searchTerm.trim() && Object.keys(filterOptions).length === 0) return notes;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return notes.filter(note => {
    // Basic search term filtering
    const matchesSearchTerm = !searchTerm.trim() || 
      note.title.toLowerCase().includes(lowerSearchTerm) || 
      note.description.toLowerCase().includes(lowerSearchTerm) || 
      note.category.toLowerCase().includes(lowerSearchTerm) ||
      (note.content && note.content.toLowerCase().includes(lowerSearchTerm)) ||
      // Search in tags as well
      (note.tags && note.tags.some(tag => tag.name.toLowerCase().includes(lowerSearchTerm)));
    
    if (!matchesSearchTerm) return false;
    
    // Advanced filtering
    // Category filter
    if (filterOptions.category && note.category !== filterOptions.category) {
      return false;
    }
    
    // Subject filter (new)
    if (filterOptions.subjectId && note.subject_id !== filterOptions.subjectId) {
      return false;
    }
    
    // Date range filter
    if (filterOptions.dateFrom) {
      const fromDate = new Date(filterOptions.dateFrom);
      const noteDate = new Date(note.date);
      if (noteDate < fromDate) return false;
    }
    
    if (filterOptions.dateTo) {
      const toDate = new Date(filterOptions.dateTo);
      const noteDate = new Date(note.date);
      if (noteDate > toDate) return false;
    }
    
    // Source type filter
    if (filterOptions.sourceType && filterOptions.sourceType.length > 0) {
      if (!note.sourceType || !filterOptions.sourceType.includes(note.sourceType)) {
        return false;
      }
    }
    
    // Has tags filter
    if (filterOptions.hasTags === true && (!note.tags || note.tags.length === 0)) {
      return false;
    }
    
    if (filterOptions.hasTags === false && note.tags && note.tags.length > 0) {
      return false;
    }
    
    return true;
  });
};

const sortNotes = (notes: Note[], sortType: SortType): Note[] => {
  return [...notes].sort((a, b) => {
    switch (sortType) {
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
};

const paginateNotes = (notes: Note[], currentPage: number, notesPerPage: number): Note[] => {
  const startIndex = (currentPage - 1) * notesPerPage;
  return notes.slice(startIndex, startIndex + notesPerPage);
};

const getUniqueCategories = (notes: Note[]): string[] => {
  const categories = notes.map(note => note.category);
  return [...new Set(categories)].sort();
};

const matchesSearchTerm = (note: Note, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return note.title.toLowerCase().includes(lowerSearchTerm) || 
    note.description.toLowerCase().includes(lowerSearchTerm) || 
    note.category.toLowerCase().includes(lowerSearchTerm) ||
    (note.content && note.content.toLowerCase().includes(lowerSearchTerm)) ||
    (note.tags && note.tags.some(tag => tag.name.toLowerCase().includes(lowerSearchTerm)));
};

// Export all functions as a single object named 'noteUtils'
export const noteUtils = {
  fetchNotesFromSupabase,
  filterNotes,
  sortNotes,
  paginateNotes,
  getUniqueCategories,
  matchesSearchTerm
};
