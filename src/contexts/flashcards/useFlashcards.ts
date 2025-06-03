
import { useFlashcardOperations } from './useFlashcardOperations';
import { useFlashcardSets } from './useFlashcardSets';
import { useLibraryOperations } from './useLibraryOperations';
import { FlashcardState } from './types';

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
    fetchFlashcardsInSet: flashcardSetsOperations.fetchFlashcardsInSet || (async () => []),
    recordFlashcardReview: async () => {},
    getFlashcardProgress: async () => null,
  };

  return combinedOperations;
};
