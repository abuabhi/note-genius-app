
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';
import { FlashcardState } from './types';

export const useLibraryOperations = (state: FlashcardState) => {
  const { toast } = useToast();

  // Fetch built-in flashcard sets for the library
  const fetchBuiltInSets = async (): Promise<FlashcardSet[]> => {
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('is_built_in', true)
        .order('name');
      
      if (error) throw error;
      
      // Add computed card count field
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
      
      return setsWithCardCount;
    } catch (error) {
      console.error('Error fetching built-in sets:', error);
      toast({
        title: 'Error fetching library sets',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Clone a built-in flashcard set for the user
  const cloneFlashcardSet = async (setId: string): Promise<FlashcardSet> => {
    try {
      // First, get the set details
      const { data: setData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();
      
      if (setError) throw setError;
      
      // Create a new set for the user (clone)
      const { data: newSet, error: newSetError } = await supabase
        .from('flashcard_sets')
        .insert({
          name: setData.name,
          description: setData.description,
          subject: setData.subject,
          topic: setData.topic,
          category_id: setData.category_id,
          is_built_in: false,
        })
        .select()
        .single();
      
      if (newSetError) throw newSetError;
      
      // Get all cards from the original set
      const { data: setCards, error: cardsError } = await supabase
        .from('flashcard_set_cards')
        .select('*, flashcard:flashcards(*)')
        .eq('set_id', setId)
        .order('position');
      
      if (cardsError) throw cardsError;
      
      // Clone each flashcard
      for (const card of setCards) {
        const flashcard = card.flashcard;
        
        // Create new flashcard
        const { data: newFlashcard, error: flashcardError } = await supabase
          .from('flashcards')
          .insert({
            front_content: flashcard.front_content,
            back_content: flashcard.back_content,
            difficulty: flashcard.difficulty,
            is_built_in: false,
          })
          .select()
          .single();
        
        if (flashcardError) throw flashcardError;
        
        // Add to the new set
        const { error: addError } = await supabase
          .from('flashcard_set_cards')
          .insert({
            set_id: newSet.id,
            flashcard_id: newFlashcard.id,
            position: card.position,
          });
        
        if (addError) throw addError;
      }
      
      return newSet;
    } catch (error) {
      console.error('Error cloning flashcard set:', error);
      toast({
        title: 'Error cloning set',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    fetchBuiltInSets,
    cloneFlashcardSet,
  };
};
