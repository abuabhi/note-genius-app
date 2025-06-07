
import { Note } from "@/types/note";
import { useNoteOperations } from './operations/noteOperations';
import { usePinArchiveOperations } from './operations/pinArchiveOperations';
import { fetchTagsFromDatabase } from './operations';

/**
 * Hook that provides all note operations with stable references
 */
export const useNotesOperations = (
  notes: Note[], 
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  paginatedNotes: Note[]
) => {
  // Get CRUD operations from the operations hook
  const { addNote, deleteNote, updateNote } = useNoteOperations(
    notes, 
    setNotes, 
    currentPage, 
    setCurrentPage, 
    paginatedNotes
  );

  // Get pin and archive operations
  const { pinNote, archiveNote } = usePinArchiveOperations(notes, setNotes);

  /**
   * Get all available tags from the user's notes
   */
  const getAllTags = async (): Promise<{id: string; name: string; color: string}[]> => {
    try {
      const tags = await fetchTagsFromDatabase();
      return tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  };

  /**
   * Filter notes by tag with stable reference
   */
  const filterByTag = (tagName: string, setSearchTerm: (term: string) => void): void => {
    console.log('Filtering by tag:', tagName);
    setSearchTerm(`tag:${tagName}`);
  };

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
