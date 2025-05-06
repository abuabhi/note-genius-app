import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { FilterOptions, SortType } from "./types";

export const fetchNotesFromSupabase = async (): Promise<Note[]> => {
  try {
    // First, fetch all the notes with their scan data
    const { data, error } = await supabase
      .from('notes')
      .select(`
        id,
        title,
        description,
        date,
        category,
        content,
        source_type,
        archived,
        pinned,
        scan_data (
          id,
          original_image_url,
          recognized_text,
          confidence,
          language
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get all note IDs to fetch tags for
    const noteIds = data.map(note => note.id);

    // Fetch all note-tag relationships for these notes
    const { data: noteTagRelations, error: noteTagError } = await supabase
      .from('note_tags')
      .select(`
        note_id,
        tags:tag_id (
          id,
          name,
          color
        )
      `)
      .in('note_id', noteIds);

    if (noteTagError) {
      throw noteTagError;
    }

    // Group tags by note_id
    const tagsByNoteId: Record<string, { id: string; name: string; color: string }[]> = {};
    noteTagRelations?.forEach(relation => {
      if (!tagsByNoteId[relation.note_id]) {
        tagsByNoteId[relation.note_id] = [];
      }
      tagsByNoteId[relation.note_id].push(relation.tags);
    });

    // Transform the data to match our Note interface
    const transformedNotes: Note[] = data.map(note => ({
      id: note.id,
      title: note.title,
      description: note.description,
      date: new Date(note.date).toISOString().split('T')[0],
      category: note.category,
      content: note.content,
      sourceType: note.source_type as 'manual' | 'scan' | 'import',
      archived: note.archived || false,
      pinned: note.pinned || false,
      tags: tagsByNoteId[note.id] || [],
      scanData: note.scan_data?.[0] ? {
        originalImageUrl: note.scan_data[0].original_image_url,
        recognizedText: note.scan_data[0].recognized_text,
        confidence: note.scan_data[0].confidence,
        language: note.scan_data[0].language
      } : undefined
    }));

    return transformedNotes;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const filterNotes = (notes: Note[], searchTerm: string, filterOptions: FilterOptions = {}): Note[] => {
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

export const sortNotes = (notes: Note[], sortType: SortType): Note[] => {
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
      default:
        return 0;
    }
  });
};

export const paginateNotes = (notes: Note[], currentPage: number, notesPerPage: number): Note[] => {
  const startIndex = (currentPage - 1) * notesPerPage;
  return notes.slice(startIndex, startIndex + notesPerPage);
};

export const getUniqueCategories = (notes: Note[]): string[] => {
  const categories = notes.map(note => note.category);
  return [...new Set(categories)].sort();
};
