import { useToast } from '@/hooks/use-toast';
import { Note } from "@/types/note";
import { 
  addNoteToDatabase, 
  deleteNoteFromDatabase, 
  updateNoteInDatabase, 
  fetchTagsFromDatabase 
} from './operations';

export function useNotesOperations(notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>, currentPage: number, setCurrentPage: React.Dispatch<React.SetStateAction<number>>, paginatedNotes: Note[]) {
  const { toast } = useToast();

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
