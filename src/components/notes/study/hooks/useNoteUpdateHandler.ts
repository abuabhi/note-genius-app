
import { useCallback } from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { Note } from '@/types/note';
import { toast } from 'sonner';

export const useNoteUpdateHandler = (noteId: string) => {
  const { updateNote } = useOptimizedNotes();

  const handleNoteUpdate = useCallback(async (updates: Partial<Note>) => {
    try {
      await updateNote(noteId, updates);
      toast.success('Note updated successfully!');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
      throw error;
    }
  }, [noteId, updateNote]);

  return { handleNoteUpdate };
};
