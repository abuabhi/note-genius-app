
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from './types';

export const useLibraryOperations = (
  state: FlashcardState
) => {
  const { 
    setFlashcardSets, 
    user 
  } = state;

  // Fetch built-in flashcard sets for the library
  const fetchBuiltInSets = async (): Promise<FlashcardSet[]> => {
    state.setLoading(prev => ({ ...prev, sets: true }));
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, flashcard_set_cards(count)')
        .eq('is_built_in', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format the sets to include card count
      const formattedSets = data.map(set => ({
        ...set,
        card_count: set.flashcard_set_cards?.[0]?.count || 0
      })) as FlashcardSet[];
      
      return formattedSets;
    } catch (error) {
      console.error('Error fetching built-in flashcard sets:', error);
      toast.error('Failed to load flashcard sets');
      return [];
    } finally {
      state.setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  // Clone a flashcard set for the user
  const cloneFlashcardSet = async (setId: string): Promise<FlashcardSet | null> => {
    if (!user) return null;

    try {
      // Get the original set
      const { data: originalSet, error: setError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', setId)
        .single();

      if (setError) throw setError;

      // Create a new set based on the original
      const { data: newSet, error: createError } = await supabase
        .from('flashcard_sets')
        .insert({
          name: `${originalSet.name} (Copy)`,
          description: originalSet.description,
          subject: originalSet.subject,
          topic: originalSet.topic,
          category_id: originalSet.category_id,
          user_id: user.id,
          is_built_in: false
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get all cards from the original set
      const { data: originalCards, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId);

      if (cardsError) throw cardsError;

      // Clone all cards to the new set
      if (originalCards && originalCards.length > 0) {
        const newCards = originalCards.map(card => ({
          front_content: card.front_content,
          back_content: card.back_content,
          user_id: user.id,
          set_id: newSet.id,
          difficulty: card.difficulty,
          is_built_in: false
        }));

        await supabase.from('flashcards').insert(newCards);
      }

      toast.success('Flashcard set cloned successfully');
      // Refresh the user's sets
      const { data: userData } = await supabase
        .from('flashcard_sets')
        .select('*, flashcard_set_cards(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (userData) {
        const formattedSets = userData.map(set => ({
          ...set,
          card_count: set.flashcard_set_cards?.[0]?.count || 0
        })) as FlashcardSet[];
        
        setFlashcardSets(formattedSets);
      }
      
      return newSet as FlashcardSet;
    } catch (error) {
      console.error('Error cloning flashcard set:', error);
      toast.error('Failed to clone flashcard set');
      return null;
    }
  };

  return {
    fetchBuiltInSets,
    cloneFlashcardSet,
  };
};
