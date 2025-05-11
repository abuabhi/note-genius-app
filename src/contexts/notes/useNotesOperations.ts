
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

export function useNotesOperations(notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>, currentPage: number, setCurrentPage: React.Dispatch<React.SetStateAction<number>>, paginatedNotes: Note[]) {
  const { toast } = useToast();

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
        toast({
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
        toast({
          title: "Failed to add note",
          description: "Please try again later.",
          variant: "destructive",
        });
        return null;
      }
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

  const deleteNote = async (id: string): Promise<void> => {
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
      throw error; // Re-throw to handle in calling component
    }
  };

  const updateNote = async (id: string, updatedNote: Partial<Note>): Promise<void> => {
    try {
      console.log("Updating note with ID:", id, "and data:", updatedNote);
      
      // Update the note in the database
      await updateNoteInDatabase(id, updatedNote);
      
      // If we have tags, update them separately
      if (updatedNote.tags) {
        console.log("Updating tags for note:", updatedNote.tags);
        await updateNoteTagsInDatabase(id, updatedNote.tags);
      }

      // Update the local state with an optimistic update
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
      throw error; // Re-throw to handle in calling component
    }
  };

  // Pin/Unpin a note
  const pinNote = async (id: string, pinned: boolean): Promise<void> => {
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
      throw error; // Re-throw to handle in calling component
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
      throw error; // Re-throw to handle in calling component
    }
  };

  // Get all available tags
  const getAllTags = async () => {
    try {
      return await fetchTagsFromDatabase();
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
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
