
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
    let isMounted = true;
    
    const loadNotes = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        console.log('🔄 Fetching notes from database...');
        
        const fetchedNotes = await fetchNotesFromSupabase();
        
        if (!isMounted) return;
        
        if (!fetchedNotes || fetchedNotes.length === 0) {
          console.log('No notes found or unable to fetch notes');
          setNotes([]);
        } else {
          console.log('✅ Notes fetched successfully:', {
            count: fetchedNotes.length,
            notesWithEnhancements: fetchedNotes.filter(note => 
              note.improved_content || note.summary || note.key_points || note.markdown_content
            ).length,
            sampleNote: fetchedNotes[0] ? {
              id: fetchedNotes[0].id,
              hasImprovedContent: !!fetchedNotes[0].improved_content,
              hasSummary: !!fetchedNotes[0].summary,
              hasKeyPoints: !!fetchedNotes[0].key_points,
              hasMarkdown: !!fetchedNotes[0].markdown_content
            } : null
          });
          setNotes(fetchedNotes);
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error fetching notes:', error);
        setNotes([]);
        toast({
          description: "Failed to load notes. Please check your connection and try again.",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Use a small delay to prevent immediate suspension
    const timeoutId = setTimeout(() => {
      loadNotes();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [setNotes, setLoading, toast]);
}
