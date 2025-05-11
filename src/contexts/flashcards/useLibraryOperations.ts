
import { FlashcardState } from './types';
import { 
  fetchBuiltInSets, 
  cloneFlashcardSet 
} from './operations/libraryOperations';

/**
 * Hook that provides library-related operations for flashcards
 */
export const useLibraryOperations = (state: FlashcardState) => {
  // Wrapper functions to pass state
  const fetchLibraryBuiltInSets = () => fetchBuiltInSets(state);
  const cloneFlashcardSetToUser = (setId: string) => cloneFlashcardSet(state, setId);

  return {
    fetchBuiltInSets: fetchLibraryBuiltInSets,
    cloneFlashcardSet: cloneFlashcardSetToUser,
  };
};
