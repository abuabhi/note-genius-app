// @ts-nocheck

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Note } from '@/types/note';
import { fetchNotesFromSupabase, NotesQueryOptions } from '@/contexts/notes/noteUtils';
import { useAuth } from '@/contexts/auth';

interface UseOptimizedNotesProps {
  options?: NotesQueryOptions;
}

export const useOptimizedNotes = ({ options }: UseOptimizedNotesProps = {}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user) {
      console.log("No user logged in");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedNotes = await fetchNotesFromSupabase(user.id, options);
      setNotes(fetchedNotes);
    } catch (err: any) {
      setError(err);
      console.error("Failed to fetch notes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshCount]);

  const refresh = useCallback(() => {
    setRefreshCount(prevCount => prevCount + 1);
  }, []);

  const memoizedNotes = useMemo(() => notes, [notes]);

  return { notes: memoizedNotes, isLoading, error, refresh };
};

