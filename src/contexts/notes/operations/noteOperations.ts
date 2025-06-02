
import { toast } from 'sonner';
import { Note } from "@/types/note";
import { 
  addNoteToDatabase, 
  deleteNoteFromDatabase, 
  updateNoteInDatabase,
  updateNoteTagsInDatabase
} from '../operations';

export const useNoteOperations = (
  notes: Note[], 
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  paginatedNotes: Note[]
) => {
  const addNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      console.log("Adding note with data:", noteData);
      
      const noteToAdd = {
        ...noteData,
        summary_status: 'pending' as 'pending' | 'generating' | 'completed' | 'failed'
      };
      
      const newNote = await addNoteToDatabase(noteToAdd);
      
      if (newNote) {
        console.log("Note added successfully:", newNote);
        setNotes(prevNotes => [newNote, ...prevNotes]);
        toast.success("Note added");
        return newNote;
      } else {
        console.error("Failed to add note: newNote is null");
        toast.error("Failed to add note");
        return null;
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error("Failed to add note");
      return null;
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    console.log(`useNoteOperations - Starting note deletion process for note ID: ${id}`);
    
    try {
      // Show deletion in progress 
      const toastId = toast.loading("Deleting note...");
      
      // Optimistic update - remove note from UI immediately
      const deletedNote = notes.find(note => note.id === id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      
      // Reset to first page if we delete the last note of the page
      if (paginatedNotes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      try {
        // Attempt to delete from database
        await deleteNoteFromDatabase(id);
        
        // Update toast on success
        toast.dismiss(toastId);
        console.log(`useNoteOperations - Note deletion successful for ID: ${id}`);
      } catch (error) {
        console.error('useNoteOperations - Error deleting note from database:', error);
        
        // Revert the optimistic update by restoring the deleted note
        if (deletedNote) {
          setNotes(prevNotes => [...prevNotes, deletedNote]);
        }
        
        toast.dismiss(toastId);
        toast.error("Failed to delete note. Please try again.");
        throw error;
      }
    } catch (error) {
      console.error('useNoteOperations - Error in delete operation:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, updatedNote: Partial<Note>): Promise<void> => {
    try {
      console.log("Updating note with ID:", id, "and data:", updatedNote);
      
      // Optimistic update - update the note in the UI immediately
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, ...updatedNote } : note
        )
      );
      
      // Update the note in the database
      await updateNoteInDatabase(id, updatedNote);
      
      // If we have tags, update them separately
      if (updatedNote.tags) {
        console.log("Updating tags for note:", updatedNote.tags);
        await updateNoteTagsInDatabase(id, updatedNote.tags);
      }

      toast.success("Note updated");
    } catch (error) {
      console.error('Error updating note:', error);
      
      // Revert the optimistic update if there was an error
      const originalNote = notes.find(note => note.id === id);
      if (originalNote) {
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === id ? originalNote : note
          )
        );
      }
      
      toast.error("Failed to update note");
      throw error;
    }
  };

  return {
    addNote,
    deleteNote,
    updateNote,
  };
};
