
import { useFlashcardOperations } from './useFlashcardOperations';
import { useLibraryOperations } from './useLibraryOperations';
import { supabase } from '@/integrations/supabase/client';
import { 
  FlashcardSet,
} from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';
import { FlashcardState } from './types';

export const useFlashcardsOperations = (
  state: FlashcardState
) => {
  const { 
    setFlashcardSets, 
    setLoading
  } = state;
  
  const { toast } = useToast();
  
  // Import operations from separate modules
  const flashcardOperations = useFlashcardOperations(state);
  const libraryOperations = useLibraryOperations(state);

  // Fetch all flashcard sets
  const fetchFlashcardSets = async (): Promise<FlashcardSet[]> => {
    try {
      setLoading(prev => ({ ...prev, sets: true }));
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(*)')
        .eq('is_built_in', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Add computed card count field (will fill in later)
      const setsWithCardCount = await Promise.all(data.map(async (set) => {
        // Get count of cards in this set
        const { count, error: countError } = await supabase
          .from('flashcard_set_cards')
          .select('*', { count: 'exact', head: true })
          .eq('set_id', set.id);
        
        if (countError) console.error('Error fetching card count:', countError);
        
        return {
          ...set,
          card_count: count || 0,
        };
      }));
      
      setFlashcardSets(setsWithCardCount);
      return setsWithCardCount;
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast({
        title: 'Error fetching flashcard sets',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  // Combine all operations
  return {
    ...flashcardOperations,
    ...libraryOperations,
    fetchFlashcardSets,
  };
};
