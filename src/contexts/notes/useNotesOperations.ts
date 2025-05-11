import { useToast } from '@/hooks/use-toast';
import { Note } from "@/types/note";
import { 
  addNoteToDatabase, 
  deleteNoteFromDatabase, 
  updateNoteInDatabase, 
  fetchTagsFromDatabase,
  updateNoteTagsInDatabase
} from './operations';
import { enrichNote } from '@/hooks/noteEnrichment/enrichmentService';
import { toast } from 'sonner'; // Using sonner toast for better user experience

export function useNotesOperations(notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>, currentPage: number, setCurrentPage: React.Dispatch<React.SetStateAction<number>>, paginatedNotes: Note[]) {
  const { toast: shadcnToast } = useToast();

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
        shadcnToast({
          title: "Note added",
          description: "Your note has been successfully added.",
        });
        
        // Automatically generate summary in background
        try {
          const content = newNote.content || newNote.description;
          const summaryContent = await enrichNote(newNote, 'summarize');
          
          // Format as markdown
          const markdownSummary = summaryContent;
          
          // Update the note with the generated summary
          await updateNoteInDatabase(newNote.id, {
            summary: markdownSummary,
            summary_generated_at: new Date().toISOString(),
            summary_status: 'completed'
          });
          
          // Update the local state
          setNotes(prevNotes => 
            prevNotes.map(note => 
              note.id === newNote.id ? {
                ...note, 
                summary: markdownSummary,
                summary_generated_at: new Date().toISOString(),
                summary_status: 'completed'
              } : note
            )
          );
          console.log("Summary automatically generated:", markdownSummary);
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
        shadcnToast({
          title: "Failed to add note",
          description: "Please try again later.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('Error adding note:', error);
      shadcnToast({
        title: "Failed to add note",
        description: "Please try again later.",
        variant: "destructive",
      });
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
        toast.error("Failed to delete note. Please try again or use force delete option.");
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

      shadcnToast({
        title: "Note updated",
        description: "Your note has been successfully updated.",
      });
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
      
      shadcnToast({
        title: "Failed to update note",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error;
    }
  };

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
      
      shadcnToast({
        title: pinned ? "Note pinned" : "Note unpinned",
        description: pinned 
          ? "Your note has been pinned to the top." 
          : "Your note has been unpinned.",
      });
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
      
      shadcnToast({
        title: "Failed to update note",
        description: "Please try again later.",
        variant: "destructive",
      });
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
      
      shadcnToast({
        title: archived ? "Note archived" : "Note restored",
        description: archived 
          ? "Your note has been moved to the archive." 
          : "Your note has been restored from the archive.",
      });
    } catch (error) {
      console.error('Error archiving note:', error);
      shadcnToast({
        title: "Failed to update note",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error; // Re-throw to handle in calling component
    }
  };

  // Get all available tags
  const getAllTags = async () => {
    try {
      return await fetchTagsFromDatabase();
    } catch (error) {
      console.error('Error fetching tags:', error);
      shadcnToast({
        title: "Failed to fetch tags",
        description: "Please try again later.",
        variant: "destructive",
      });
      return [];
    }
  };

  // Filter notes by a specific tag
  const filterByTag = (tagName: string, setSearchTerm: (term: string) => void) => {
    // Get the current search term first
    const terms = notes.length > 0 ? 
      notes[0].tags?.map(tag => tag.name).filter(name => name === tagName) || [] : 
      [];
    
    // Add the tag name to the search term if not already included
    if (!terms.includes(tagName)) {
      terms.push(tagName);
    }
    
    // Set the search term directly as a string
    setSearchTerm(terms.join(' ').trim());
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
}
