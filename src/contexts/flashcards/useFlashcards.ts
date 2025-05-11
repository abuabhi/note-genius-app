
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
