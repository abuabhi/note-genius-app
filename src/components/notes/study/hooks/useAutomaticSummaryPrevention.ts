
import { useEffect } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

export const useAutomaticSummaryPrevention = (note: Note) => {
  const { updateNote } = useOptimizedNotes();

  useEffect(() => {
    // CRITICAL FIX: Prevent automatic summary generation more aggressively
    if (note.summary_status === 'generating' && !note.summary) {
      console.log('🛑 PREVENTING automatic summary generation for note:', note.id);
      console.log('🛑 Resetting summary_status from generating to pending');
      updateNote(note.id, { summary_status: 'pending' });
    }

    // Also prevent enriched content auto-generation
    if (note.enriched_status === 'generating' && !note.enriched_content) {
      console.log('🛑 PREVENTING automatic enriched content generation for note:', note.id);
      console.log('🛑 Resetting enriched_status from generating to pending');
      updateNote(note.id, { enriched_status: 'pending' });
    }
  }, [note.id, note.summary_status, note.enriched_status, note.summary, note.enriched_content, updateNote]);

  return {
    preventAutoSummary: () => {
      console.log('🛑 MANUALLY preventing auto summary for note:', note.id);
      updateNote(note.id, { summary_status: 'pending' });
    },
    preventAutoEnriched: () => {
      console.log('🛑 MANUALLY preventing auto enriched content for note:', note.id);
      updateNote(note.id, { enriched_status: 'pending' });
    }
  };
};
