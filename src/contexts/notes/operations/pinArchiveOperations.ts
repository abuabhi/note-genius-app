
import { toast } from 'sonner';
import { Note } from "@/types/note";
import { updateNoteInDatabase } from './';

export const usePinArchiveOperations = (
  notes: Note[], 
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>
) => {
  // Pin/Unpin a note with improved error handling
  const pinNote = async (id: string, pinned: boolean): Promise<void> => {
    console.log(`${pinned ? 'Pinning' : 'Unpinning'} note with ID:`, id);
    
    // Get the original note before changes
    const originalNote = notes.find(note => note.id === id);
    
    try {
      // Optimistic update
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, pinned } : note
        )
      );
      
      // Update in database
      await updateNoteInDatabase(id, { pinned });
      
      toast.success(pinned ? "Note pinned" : "Note unpinned");
    } catch (error) {
      console.error('Error pinning note:', error);
      
      // Revert optimistic update if there's an error
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

  // Archive/Unarchive a note
  const archiveNote = async (id: string, archived: boolean): Promise<void> => {
    try {
      await updateNoteInDatabase(id, { archived });

      // Update the local state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, archived } : note
        )
      );
      
      toast.success(archived ? "Note archived" : "Note restored");
    } catch (error) {
      console.error('Error archiving note:', error);
      toast.error("Failed to update note");
      throw error;
    }
  };

  return {
    pinNote,
    archiveNote
  };
};
