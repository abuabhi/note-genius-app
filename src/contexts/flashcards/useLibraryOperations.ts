
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from './types';
import { convertToFlashcardSet } from './utils/flashcardSetMappers';

/**
 * Hook that provides library-related operations for flashcards
 */
export const useLibraryOperations = (state: FlashcardState) => {
  const { setFlashcardSets, user } = state;

  /**
   * Fetch built-in flashcard sets for the library
   */
  const fetchBuiltInSets = async () => {
    state.setLoading(prev => ({ ...prev, sets: true }));
    
    try {
      // Get all built-in sets
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(id, name)')
        .eq('is_built_in', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get card counts for each set
      const sets = await Promise.all(
        data.map(async (set) => {
          const { count, error: countError } = await supabase
            .from('flashcard_set_cards')
            .select('*', { count: 'exact', head: true })
            .eq('set_id', set.id);
            
          return {
            ...set,
            card_count: countError ? 0 : count || 0
          };
        })
      );
      
      // Use the utility function to convert to FlashcardSet objects
      return sets.map(set => convertToFlashcardSet(set));
    } catch (error) {
      console.error('Error fetching built-in flashcard sets:', error);
      toast.error('Failed to load flashcard sets');
      return [];
    } finally {
      state.setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  /**
   * Clone a flashcard set for the current user
   */
  const cloneFlashcardSet = async (setId: string) => {
    if (!user) {
      toast.error("You must be logged in to clone sets");
      return null;
    }

    try {
      // Step 1: Get original set data
      const { data: originalSetData, error: setError } = await supabase
        .from('flashcard_sets')
        .select('name, description, subject, topic, category_id')
        .eq('id', setId)
        .single();

      if (setError) {
        toast.error("Could not find the original set");
        return null;
      }

      // Step 2: Create new set with basic data
      const newSetData = {
        name: `${originalSetData.name} (Copy)`,
        description: originalSetData.description,
        subject: originalSetData.subject,
        topic: originalSetData.topic,
        category_id: originalSetData.category_id,
        user_id: user.id,
        is_built_in: false
      };

      // Step 3: Insert new set
      const { data: newSetData, error: createError } = await supabase
        .from('flashcard_sets')
        .insert(newSetData)
        .select('id, name, description, user_id, created_at, updated_at, subject, topic, category_id')
        .single();

      if (createError || !newSetData) {
        toast.error("Failed to create new set");
        return null;
      }

      // Step 4: Get all cards from original set
      const { data: originalCards, error: cardsError } = await supabase
        .from('flashcards')
        .select('front_content, back_content, difficulty')
        .eq('set_id', setId);

      if (cardsError) {
        console.error("Error fetching original cards:", cardsError);
      }

      // Step 5: Clone cards if there are any
      const cardCount = originalCards?.length || 0;
      
      if (originalCards && originalCards.length > 0) {
        const newCards = originalCards.map(card => ({
          front_content: card.front_content,
          back_content: card.back_content,
          user_id: user.id,
          set_id: newSetData.id,
          difficulty: card.difficulty,
          is_built_in: false
        }));

        await supabase.from('flashcards').insert(newCards);
      }

      // Step 6: Create a simple object to return and update state with
      const clonedSet: FlashcardSet = {
        ...newSetData,
        is_built_in: false,
        card_count: cardCount
      };
      
      // Update app state with new set
      setFlashcardSets(prevSets => [clonedSet, ...prevSets]);
      
      toast.success('Flashcard set cloned successfully');
      return clonedSet;
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
