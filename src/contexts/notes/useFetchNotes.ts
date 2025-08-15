// @ts-nocheck

import { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { fetchNotesFromSupabase, NotesQueryOptions } from './noteUtils';

import { useAuth } from '@/contexts/auth';

interface UseFetchNotesProps {
  options?: NotesQueryOptions;
}

interface UseFetchNotesResult {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export const useFetchNotes = ({ options }: UseFetchNotesProps = {}): UseFetchNotesResult => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      console.log("No user logged in")
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
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, options]);

  const refresh = () => {
    fetchData();
  };

  return { notes, isLoading, error, refresh };
};
