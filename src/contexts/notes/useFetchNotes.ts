
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
        
        // Handle case where fetchedNotes is empty or undefined
        if (!fetchedNotes || fetchedNotes.length === 0) {
          console.log('No notes found or unable to fetch notes');
          setNotes([]);
        } else {
          setNotes(fetchedNotes);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        // Set empty array to prevent infinite loading state
        setNotes([]);
        toast({
          title: "Failed to load notes",
          description: "Please check your connection and try again.",
          variant: "destructive",
        });
      } finally {
        // Ensure loading state is always turned off, even if there's an error
        setLoading(false);
      }
    };

    loadNotes();
  }, [setNotes, setLoading, toast]);
}
