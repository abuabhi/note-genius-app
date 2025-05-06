
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { SortType } from "./types";

export const fetchNotesFromSupabase = async (): Promise<Note[]> => {
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
      scan_data (
        id,
        original_image_url,
        recognized_text,
        confidence
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  // Transform the data to match our Note interface
  const transformedNotes: Note[] = data.map(note => ({
    id: note.id,
    title: note.title,
    description: note.description,
    date: new Date(note.date).toISOString().split('T')[0],
    category: note.category,
    content: note.content,
    sourceType: note.source_type as 'manual' | 'scan' | 'import',
    scanData: note.scan_data?.[0] ? {
      originalImageUrl: note.scan_data[0].original_image_url,
      recognizedText: note.scan_data[0].recognized_text,
      confidence: note.scan_data[0].confidence
    } : undefined
  }));

  return transformedNotes;
};

export const filterNotes = (notes: Note[], searchTerm: string): Note[] => {
  if (!searchTerm.trim()) return notes;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return notes.filter(note => 
    note.title.toLowerCase().includes(lowerSearchTerm) || 
    note.description.toLowerCase().includes(lowerSearchTerm) || 
    note.category.toLowerCase().includes(lowerSearchTerm) ||
    (note.content && note.content.toLowerCase().includes(lowerSearchTerm))
  );
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
