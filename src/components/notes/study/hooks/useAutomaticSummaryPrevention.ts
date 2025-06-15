
import { useEffect } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

export const useAutomaticSummaryPrevention = (note: Note) => {
  const { updateNote } = useOptimizedNotes();

  useEffect(() => {
    // Prevent automatic summary generation by setting status to pending
    if (note.summary_status === 'generating') {
      console.log('🛑 Preventing automatic summary generation for note:', note.id);
      updateNote(note.id, { summary_status: 'pending' });
    }
  }, [note.id, note.summary_status, updateNote]);

  return {
    preventAutoSummary: () => {
      updateNote(note.id, { summary_status: 'pending' });
    }
  };
};
