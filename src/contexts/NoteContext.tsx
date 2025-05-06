
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Note } from '@/types/note';

type SortType = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'category';

interface NoteContextType {
  notes: Note[];
  filteredNotes: Note[];
  paginatedNotes: Note[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (id: string, updatedNote: Partial<Note>) => Promise<void>;
  sortType: SortType;
  setSortType: (type: SortType) => void;
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  notesPerPage: number;
  setNotesPerPage: (count: number) => void;
  loading: boolean;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [notesPerPage, setNotesPerPage] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Fetch notes from Supabase on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
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
        sourceType: note.source_type as 'manual' | 'scan',
        scanData: note.scan_data?.[0] ? {
          originalImageUrl: note.scan_data[0].original_image_url,
          recognizedText: note.scan_data[0].recognized_text,
          confidence: note.scan_data[0].confidence
        } : undefined
      }));

      setNotes(transformedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Failed to load notes",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter notes based on search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerSearchTerm) || 
      note.description.toLowerCase().includes(lowerSearchTerm) || 
      note.category.toLowerCase().includes(lowerSearchTerm) ||
      (note.content && note.content.toLowerCase().includes(lowerSearchTerm))
    );
  }, [notes, searchTerm]);

  // Sort the filtered notes
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
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
  }, [filteredNotes, sortType]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedNotes.length / notesPerPage);

  // Get current notes for the page
  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * notesPerPage;
    return sortedNotes.slice(startIndex, startIndex + notesPerPage);
  }, [sortedNotes, currentPage, notesPerPage]);

  const addNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      // First, insert the note
      const { data: noteInsertData, error: noteError } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          description: noteData.description,
          date: noteData.date,
          category: noteData.category,
          content: noteData.content,
          source_type: noteData.sourceType
        })
        .select()
        .single();

      if (noteError) {
        throw noteError;
      }

      // If it's a scanned note, insert the scan data
      if (noteData.sourceType === 'scan' && noteData.scanData) {
        const { error: scanError } = await supabase
          .from('scan_data')
          .insert({
            note_id: noteInsertData.id,
            original_image_url: noteData.scanData.originalImageUrl,
            recognized_text: noteData.scanData.recognizedText,
            confidence: noteData.scanData.confidence
          });

        if (scanError) {
          throw scanError;
        }
      }

      // Create a new note object with the inserted data
      const newNote: Note = {
        id: noteInsertData.id,
        title: noteInsertData.title,
        description: noteInsertData.description,
        date: new Date(noteInsertData.date).toISOString().split('T')[0],
        category: noteInsertData.category,
        content: noteInsertData.content,
        sourceType: noteInsertData.source_type as 'manual' | 'scan',
        scanData: noteData.sourceType === 'scan' && noteData.scanData ? {
          originalImageUrl: noteData.scanData.originalImageUrl,
          recognizedText: noteData.scanData.recognizedText,
          confidence: noteData.scanData.confidence
        } : undefined
      };

      // Update the local state with the new note
      setNotes(prevNotes => [newNote, ...prevNotes]);
      
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Failed to add note",
        description: "Please try again later.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update the local state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      
      // Reset to first page if we delete the last note of the page
      if (paginatedNotes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      toast({
        title: "Note deleted",
        description: "Your note has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Failed to delete note",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const updateNote = async (id: string, updatedNote: Partial<Note>) => {
    try {
      // Prepare the note data for update
      const noteUpdateData: any = {};
      if (updatedNote.title !== undefined) noteUpdateData.title = updatedNote.title;
      if (updatedNote.description !== undefined) noteUpdateData.description = updatedNote.description;
      if (updatedNote.date !== undefined) noteUpdateData.date = updatedNote.date;
      if (updatedNote.category !== undefined) noteUpdateData.category = updatedNote.category;
      if (updatedNote.content !== undefined) noteUpdateData.content = updatedNote.content;
      if (updatedNote.sourceType !== undefined) noteUpdateData.source_type = updatedNote.sourceType;

      if (Object.keys(noteUpdateData).length > 0) {
        const { error: noteError } = await supabase
          .from('notes')
          .update(noteUpdateData)
          .eq('id', id);

        if (noteError) {
          throw noteError;
        }
      }

      // Update scan data if provided
      if (updatedNote.scanData) {
        const { error: scanError } = await supabase
          .from('scan_data')
          .update({
            original_image_url: updatedNote.scanData.originalImageUrl,
            recognized_text: updatedNote.scanData.recognizedText,
            confidence: updatedNote.scanData.confidence
          })
          .eq('note_id', id);

        if (scanError) {
          throw scanError;
        }
      }

      // Update the local state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, ...updatedNote } : note
        )
      );
      
      toast({
        title: "Note updated",
        description: "Your note has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Failed to update note",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <NoteContext.Provider value={{ 
      notes, 
      filteredNotes: sortedNotes, 
      paginatedNotes,
      searchTerm, 
      setSearchTerm, 
      addNote, 
      deleteNote, 
      updateNote,
      sortType,
      setSortType,
      currentPage,
      setCurrentPage,
      totalPages,
      notesPerPage,
      setNotesPerPage,
      loading
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
