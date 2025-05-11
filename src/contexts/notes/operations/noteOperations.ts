
import { toast } from 'sonner';
import { Note } from "@/types/note";
import { 
  addNoteToDatabase, 
  deleteNoteFromDatabase, 
  updateNoteInDatabase, 
  updateNoteTagsInDatabase
} from './';
import { enrichNote } from '@/hooks/noteEnrichment/enrichmentService';

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
      
      // Set the summary_status to 'generating' to indicate we're going to generate a summary
      const noteToAdd = {
        ...noteData,
        summary_status: 'generating' as 'pending' | 'generating' | 'completed' | 'failed'
      };
      
      const newNote = await addNoteToDatabase(noteToAdd);
      
      if (newNote) {
        console.log("Note added successfully:", newNote);
        // Update the local state with the new note
        setNotes(prevNotes => [newNote, ...prevNotes]);
        toast.success("Note added");
        
        // Automatically generate summary in background
        try {
          const summaryContent = await enrichNote(newNote, 'summarize');
          
          // Update the note with the generated summary
          await updateNoteInDatabase(newNote.id, {
            summary: summaryContent,
            summary_generated_at: new Date().toISOString(),
            summary_status: 'completed'
          });
          
          // Update the local state
          setNotes(prevNotes => 
            prevNotes.map(note => 
              note.id === newNote.id ? {
                ...note, 
                summary: summaryContent,
                summary_generated_at: new Date().toISOString(),
                summary_status: 'completed'
              } : note
            )
          );
          console.log("Summary automatically generated:", summaryContent);
        } catch (error) {
          console.error("Error auto-generating summary:", error);
          // Update status to failed
          await updateNoteInDatabase(newNote.id, {
            summary_status: 'failed'
          });
          
          // Update the local state
          setNotes(prevNotes => 
            prevNotes.map(note => 
              note.id === newNote.id ? {
                ...note, 
                summary_status: 'failed'
              } : note
            )
          );
        }
        
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
    try {
      // Show deletion in progress with loading indicator
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
        toast.success("Note deleted successfully");
      } catch (error) {
        console.error('Error deleting note:', error);
        
        // Revert the optimistic update by restoring the deleted note
        if (deletedNote) {
          setNotes(prevNotes => [deletedNote, ...prevNotes]);
        }
        
        toast.dismiss(toastId);
        toast.error("Failed to delete note. Please try again.");
        throw error;
      }
    } catch (error) {
      console.error('Error in delete operation:', error);
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
