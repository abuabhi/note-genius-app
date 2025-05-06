
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchNotesFromSupabase } from './noteUtils';
import { Note } from '@/types/note';

export function useFetchNotes(
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { toast } = useToast();
  
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const fetchedNotes = await fetchNotesFromSupabase();
        setNotes(fetchedNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: "Failed to load notes",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [setNotes, setLoading, toast]);
}
