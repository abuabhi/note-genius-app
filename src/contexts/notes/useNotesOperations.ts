
import { Note } from "@/types/note";
import { useNoteOperations } from './operations/noteOperations';
import { usePinArchiveOperations } from './operations/pinArchiveOperations';
import { useTagOperations } from './operations/tagOperations';

export function useNotesOperations(
  notes: Note[], 
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>, 
  currentPage: number, 
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  paginatedNotes: Note[]
) {
  // Get note CRUD operations
  const { addNote, deleteNote, updateNote } = useNoteOperations(notes, setNotes, currentPage, setCurrentPage, paginatedNotes);
  
  // Get pin & archive operations
  const { pinNote, archiveNote } = usePinArchiveOperations(notes, setNotes);
  
  // Get tag operations
  const { getAllTags, filterByTag } = useTagOperations();

  return {
    addNote,
    deleteNote,
    updateNote,
    pinNote,
    archiveNote,
    getAllTags,
    filterByTag
  };
}
