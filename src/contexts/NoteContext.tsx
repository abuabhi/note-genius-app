
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Note } from '@/types/note';
import { NoteContextType, SortType, FilterOptions } from './notes/types';
import { fetchNotesFromSupabase, filterNotes, sortNotes, paginateNotes, getUniqueCategories } from './notes/noteUtils';
import { addNoteToDatabase, deleteNoteFromDatabase, updateNoteInDatabase, fetchTagsFromDatabase } from './notes/noteOperations';

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [notesPerPage, setNotesPerPage] = useState<number>(6);
  const [loading, setLoading] = useState<boolean>(true);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const { toast } = useToast();

  // Fetch notes from Supabase on component mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const fetchedNotes = await fetchNotesFromSupabase();
        setNotes(fetchedNotes);
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

    loadNotes();
  }, [toast]);

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

  const addNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const newNote = await addNoteToDatabase(noteData);
      
      if (newNote) {
        // Update the local state with the new note
        setNotes(prevNotes => [newNote, ...prevNotes]);
        toast({
          title: "Note added",
          description: "Your note has been successfully added.",
        });
      }
      
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
      await deleteNoteFromDatabase(id);

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
      await updateNoteInDatabase(id, updatedNote);

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

  // Pin/Unpin a note
  const pinNote = async (id: string, pinned: boolean) => {
    try {
      await updateNoteInDatabase(id, { pinned });

      // Update the local state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, pinned } : note
        )
      );
      
      toast({
        title: pinned ? "Note pinned" : "Note unpinned",
        description: pinned 
          ? "Your note has been pinned to the top." 
          : "Your note has been unpinned.",
      });
    } catch (error) {
      console.error('Error pinning note:', error);
      toast({
        title: "Failed to update note",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Archive/Unarchive a note
  const archiveNote = async (id: string, archived: boolean) => {
    try {
      await updateNoteInDatabase(id, { archived });

      // Update the local state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, archived } : note
        )
      );
      
      toast({
        title: archived ? "Note archived" : "Note restored",
        description: archived 
          ? "Your note has been moved to the archive." 
          : "Your note has been restored from the archive.",
      });
    } catch (error) {
      console.error('Error archiving note:', error);
      toast({
        title: "Failed to update note",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Get all available tags
  const getAllTags = async () => {
    return await fetchTagsFromDatabase();
  };

  // Filter notes by a specific tag
  const filterByTag = (tagName: string) => {
    // Add the tag name to the search term
    setSearchTerm(prevTerm => {
      const terms = prevTerm.split(' ').filter(term => term !== tagName);
      terms.push(tagName);
      return terms.join(' ').trim();
    });
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
      filterByTag,
      filterOptions,
      setFilterOptions,
      resetFilters,
      availableCategories
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
