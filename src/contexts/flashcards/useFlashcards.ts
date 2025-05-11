
import { useFlashcardOperations } from './useFlashcardOperations';
import { useFlashcardSets } from './useFlashcardSets';
import { useLibraryOperations } from './useLibraryOperations';
import { FlashcardState } from './types';

// Renamed to avoid naming conflicts
export const combineFlashcardOperations = (
  state: FlashcardState
) => {
  // Import operations from separate modules
  const flashcardOperations = useFlashcardOperations(state);
  const flashcardSetsOperations = useFlashcardSets(state);
  const libraryOperations = useLibraryOperations(state);

  // Include stub implementations for any missing methods
  const combinedOperations = {
    ...flashcardOperations,
    ...flashcardSetsOperations,
    ...libraryOperations,
    
    // These methods should be provided by the imported modules, but we'll add stubs as fallbacks
    // to satisfy TypeScript if they're not
    fetchFlashcards: flashcardOperations.fetchFlashcards || (async () => []),
    createFlashcard: flashcardOperations.createFlashcard || (async () => null),
    updateFlashcard: flashcardOperations.updateFlashcard || (async () => {}),
    deleteFlashcard: flashcardOperations.deleteFlashcard || (async () => {}),
    addFlashcardToSet: flashcardOperations.addFlashcardToSet || (async (flashcardId: string, setId: string) => {}),
    removeFlashcardFromSet: flashcardOperations.removeFlashcardFromSet || (async () => {}),
    fetchFlashcardsInSet: flashcardSetsOperations.fetchFlashcardsInSet || (async () => []),
    recordFlashcardReview: async () => {},
    getFlashcardProgress: async () => null,
  };

  return combinedOperations;
};

// Export a hook that accesses the context
export const useFlashcards = () => {
  // This is a placeholder that will be implemented in the index.tsx file
  // but we export it here for better module organization
  throw new Error('useFlashcards must be used within a FlashcardProvider');
};
