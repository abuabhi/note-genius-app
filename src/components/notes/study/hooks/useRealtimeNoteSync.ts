
import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeNoteSync = (initialNote: Note) => {
  const { updateNote } = useOptimizedNotes();
  const [currentNote, setCurrentNote] = useState<Note>(initialNote);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  // Sync note data from database
  const syncFromDatabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', initialNote.id)
        .single();

      if (error) {
        console.error('Error syncing note:', error);
        return;
      }

      if (data) {
        const syncedNote: Note = {
          ...initialNote,
          title: data.title || initialNote.title,
          content: data.content || initialNote.content,
          subject: data.subject || initialNote.subject,
          description: data.description || initialNote.description,
          summary: data.summary,
          summary_status: data.summary_status as any,
          key_points: data.key_points,
          markdown_content: data.markdown_content,
          improved_content: data.improved_content
        };

        setCurrentNote(syncedNote);
        setLastSyncTime(Date.now());
      }
    } catch (error) {
      console.error('Unexpected error syncing note:', error);
    }
  }, [initialNote]);

  // Force refresh from database
  const forceRefresh = useCallback(() => {
    syncFromDatabase();
  }, [syncFromDatabase]);

  // Periodic sync
  useEffect(() => {
    const interval = setInterval(syncFromDatabase, 30000); // Sync every 30 seconds
    return () => clearInterval(interval);
  }, [syncFromDatabase]);

  return {
    currentNote,
    lastSyncTime,
    forceRefresh,
    refreshKey: lastSyncTime
  };
};
