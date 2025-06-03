
import { FlashcardState } from './types';
import { 
  fetchFlashcardSets as fetchSets, 
  fetchCategories as fetchCats
} from './operations/fetchOperations';
import {
  createFlashcardSet as createSet,
  updateFlashcardSet as updateSet,
  deleteFlashcardSet as deleteSet
} from './operations/mutationOperations';
import { supabase } from '@/integrations/supabase/client';
import { Flashcard } from '@/types/flashcard';

export const useFlashcardSets = (state: FlashcardState) => {
  // Wrapper functions to pass state
  const fetchFlashcardSets = () => fetchSets(state);
  const createFlashcardSet = (setData) => createSet(state, setData);
  const updateFlashcardSet = (id, setData) => updateSet(state, id, setData);
  const deleteFlashcardSet = (id) => deleteSet(state, id);
  const fetchCategories = () => fetchCats(state);
  
  // Properly implement fetchFlashcardsInSet method
  const fetchFlashcardsInSet = async (setId: string): Promise<Flashcard[]> => {
    try {
      console.log("Fetching flashcards for set:", setId);
      
      // Query the flashcard_set_cards junction table to get flashcards in this set
      const { data: setCards, error: setCardsError } = await supabase
        .from('flashcard_set_cards')
        .select(`
          flashcard_id,
          position,
          flashcards (
            id,
            front_content,
            back_content,
            difficulty,
            created_at,
            updated_at,
            user_id,
            is_built_in,
            last_reviewed_at,
            next_review_at
          )
        `)
        .eq('set_id', setId)
        .order('position');

      if (setCardsError) {
        console.error("Error fetching flashcards in set:", setCardsError);
        throw setCardsError;
      }

      if (!setCards || setCards.length === 0) {
        console.log("No flashcards found in set:", setId);
        return [];
      }

      // Transform the data to match the Flashcard interface
      const flashcards: Flashcard[] = setCards
        .filter(card => card.flashcards) // Filter out any null flashcard references
        .map(card => {
          const flashcard = card.flashcards;
          return {
            id: flashcard.id,
            front_content: flashcard.front_content,
            back_content: flashcard.back_content,
            // For backward compatibility
            front: flashcard.front_content,
            back: flashcard.back_content,
            set_id: setId,
            difficulty: flashcard.difficulty,
            created_at: flashcard.created_at,
            updated_at: flashcard.updated_at,
            user_id: flashcard.user_id,
            is_built_in: flashcard.is_built_in,
            last_reviewed_at: flashcard.last_reviewed_at,
            next_review_at: flashcard.next_review_at,
            position: card.position
          };
        });

      console.log("Fetched flashcards:", flashcards);
      return flashcards;
      
    } catch (error) {
      console.error("Error in fetchFlashcardsInSet:", error);
      throw error;
    }
  };
  
  // For backward compatibility, keep the function to fetch built-in sets
  const fetchBuiltInSets = async () => {
    // This function has been moved to useLibraryOperations
    // but we keep it here for backward compatibility
    return [];
  };

  return {
    fetchFlashcardSets,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    fetchBuiltInSets,
    fetchCategories,
    fetchFlashcardsInSet
  };
};
