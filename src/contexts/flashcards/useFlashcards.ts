
import { useFlashcardOperations } from './useFlashcardOperations';
import { useFlashcardSets } from './useFlashcardSets';
import { useLibraryOperations } from './useLibraryOperations';
import { FlashcardState } from './types';

export const useFlashcardsOperations = (
  state: FlashcardState
) => {
  // Import operations from separate modules
  const flashcardOperations = useFlashcardOperations(state);
  const flashcardSetsOperations = useFlashcardSets(state);
  const libraryOperations = useLibraryOperations(state);

  // Combine all operations
  return {
    ...flashcardOperations,
    ...flashcardSetsOperations,
    ...libraryOperations,
  };
};

// Export a hook that accesses the context
export const useFlashcards = () => {
  // This is a placeholder that will be implemented in the index.tsx file
  // but we export it here for better module organization
  throw new Error('useFlashcards must be used within a FlashcardProvider');
};
