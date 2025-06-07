
import { Note } from "@/types/note";
import { useNoteOperations } from './operations/noteOperations';
import { usePinArchiveOperations } from './operations/pinArchiveOperations';
import { fetchTagsFromDatabase } from './operations';
import { useCallback } from 'react';

/**
 * Hook that provides all note operations with stable references and error handling
 */
export const useNotesOperations = (
  notes: Note[], 
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  paginatedNotes: Note[]
) => {
  // Get CRUD operations from the operations hook with error handling
  const noteOperations = useNoteOperations(
    notes, 
    setNotes, 
    currentPage, 
    setCurrentPage, 
    paginatedNotes
  );

  if (!noteOperations) {
    throw new Error('Note operations could not be initialized');
  }

  const { addNote, deleteNote, updateNote } = noteOperations;

  // Get pin and archive operations with error handling
  const pinArchiveOperations = usePinArchiveOperations(notes, setNotes);
  
  if (!pinArchiveOperations) {
    throw new Error('Pin/archive operations could not be initialized');
  }

  const { pinNote, archiveNote } = pinArchiveOperations;

  /**
   * Get all available tags from the user's notes with error handling
   */
  const getAllTags = useCallback(async (): Promise<{id: string; name: string; color: string}[]> => {
    try {
      const tags = await fetchTagsFromDatabase();
      return tags || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }, []);

  /**
   * Filter notes by tag with stable reference and error handling
   */
  const filterByTag = useCallback((tagName: string, setSearchTerm: (term: string) => void): void => {
    try {
      console.log('Filtering by tag:', tagName);
      setSearchTerm(`tag:${tagName}`);
    } catch (error) {
      console.error('Error filtering by tag:', error);
    }
  }, []);

  return {
    addNote,
    deleteNote,
    updateNote,
    pinNote,
    archiveNote,
    getAllTags,
    filterByTag
  };
};
