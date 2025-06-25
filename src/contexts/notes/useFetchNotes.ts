
import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { fetchNotesFromSupabase, NotesQueryOptions } from './noteUtils';

export const useFetchNotes = (options: NotesQueryOptions = {}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchNotesFromSupabase(options);
        setNotes(result.notes);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [JSON.stringify(options)]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchNotesFromSupabase(options);
      if (result.notes && result.notes.length > 0) {
        setNotes(result.notes);
      }
    } catch (err) {
      console.error('Error refetching notes:', err);
      setError(err instanceof Error ? err.message : 'Failed to refetch notes');
    } finally {
      setLoading(false);
    }
  };

  return {
    notes,
    loading,
    error,
    refetch
  };
};
