
import { useFlashcardOperations } from './useFlashcardOperations';
import { useFlashcardSets } from './useFlashcardSets';
import { useLibraryOperations } from './useLibraryOperations';
import { FlashcardState } from './types';
import { supabase } from '@/integrations/supabase/client';

// This function combines all flashcard operations without using hooks
export const combineFlashcardOperations = (
  state: FlashcardState
) => {
  // Import operations from separate modules
  const flashcardOperations = useFlashcardOperations(state);
  const flashcardSetsOperations = useFlashcardSets(state);
  const libraryOperations = useLibraryOperations(state);

  // Combine all operations
  const combinedOperations = {
    ...flashcardOperations,
    ...flashcardSetsOperations,
    ...libraryOperations,
    
    // Ensure all required methods are available
    fetchFlashcards: flashcardOperations.fetchFlashcards || (async () => []),
    createFlashcard: flashcardOperations.createFlashcard || (async () => null),
    updateFlashcard: flashcardOperations.updateFlashcard || (async () => {}),
    deleteFlashcard: flashcardOperations.deleteFlashcard || (async () => {}),
    addFlashcardToSet: flashcardOperations.addFlashcardToSet || (async () => {}),
    removeFlashcardFromSet: flashcardOperations.removeFlashcardFromSet || (async () => {}),
    fetchFlashcardsInSet: flashcardSetsOperations.fetchFlashcardsInSet,
    
    // Properly implement recordFlashcardReview using spaced repetition
    recordFlashcardReview: async (flashcardId: string, score: 0 | 1 | 2 | 3 | 4 | 5) => {
      if (!state.user) {
        console.error("User not authenticated");
        return;
      }

      try {
        // Get current progress
        const { data: currentProgress } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', state.user.id)
          .eq('flashcard_id', flashcardId)
          .single();

        // Calculate new values based on spaced repetition algorithm
        let newEaseFactor = currentProgress?.ease_factor || 2.5;
        let newInterval = currentProgress?.interval || 0;
        let newRepetition = currentProgress?.repetition || 0;

        if (score >= 3) {
          // Correct response
          newRepetition += 1;
          if (newRepetition === 1) {
            newInterval = 1;
          } else if (newRepetition === 2) {
            newInterval = 6;
          } else {
            newInterval = Math.round(newInterval * newEaseFactor);
          }
          newEaseFactor = newEaseFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
        } else {
          // Incorrect response
          newRepetition = 0;
          newInterval = 1;
          newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
        }

        // Ensure ease factor doesn't go below 1.3
        newEaseFactor = Math.max(1.3, newEaseFactor);

        // Calculate next review date
        const nextReviewAt = new Date();
        nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

        // Update progress in database
        await supabase
          .from('user_flashcard_progress')
          .upsert({
            user_id: state.user.id,
            flashcard_id: flashcardId,
            ease_factor: newEaseFactor,
            interval: newInterval,
            repetition: newRepetition,
            last_reviewed_at: new Date().toISOString(),
            next_review_at: nextReviewAt.toISOString(),
            last_score: score,
          }, { onConflict: 'user_id,flashcard_id' });

        // Also update learning progress for the learn mode stats
        await supabase
          .from('learning_progress')
          .upsert({
            user_id: state.user.id,
            flashcard_id: flashcardId,
            times_seen: (currentProgress?.repetition || 0) + 1,
            times_correct: score >= 3 ? ((currentProgress?.repetition || 0) + 1) : (currentProgress?.repetition || 0),
            last_seen_at: new Date().toISOString(),
            confidence_level: Math.min(5, Math.max(1, score)),
          }, { onConflict: 'user_id,flashcard_id' });

        console.log("Recorded flashcard review:", flashcardId, score);
      } catch (error) {
        console.error("Error recording flashcard review:", error);
        throw error;
      }
    },
    
    getFlashcardProgress: async (flashcardId: string) => {
      if (!state.user) return null;
      
      try {
        const { data } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', state.user.id)
          .eq('flashcard_id', flashcardId)
          .single();
        
        return data;
      } catch (error) {
        console.error("Error fetching flashcard progress:", error);
        return null;
      }
    },
  };

  return combinedOperations;
};
