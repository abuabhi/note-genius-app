
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchNotesFromSupabase } from './noteUtils';
import { Note } from '@/types/note';

export function useFetchNotes(
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { toast } = useToast();
  const hasFetchedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  
  const loadNotes = async (isRetry = false) => {
    if (hasFetchedRef.current && !isRetry) return;
    
    try {
      if (!isRetry) {
        hasFetchedRef.current = true;
      }
      
      console.log('🔄 Loading notes...', isRetry ? '(retry)' : '(initial)');
      setError(null);
      
      const fetchedNotes = await fetchNotesFromSupabase();
      
      console.log('✅ Notes loaded successfully:', fetchedNotes.length);
      setNotes(fetchedNotes);
      setLoading(false);
      retryCountRef.current = 0;
      
    } catch (error) {
      console.error('❌ Error loading notes:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      
      // Auto-retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`🔄 Auto-retrying... (${retryCountRef.current}/${maxRetries})`);
        setTimeout(() => loadNotes(true), 1000 * retryCountRef.current);
        return;
      }
      
      // Final failure
      setNotes([]);
      setLoading(false);
      
      toast({
        description: "Failed to load notes. Please refresh the page or try again.",
        variant: "destructive",
      });
    }
  };

  const retryManually = () => {
    retryCountRef.current = 0;
    hasFetchedRef.current = false;
    setLoading(true);
    loadNotes(true);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return { error, retryManually };
}
