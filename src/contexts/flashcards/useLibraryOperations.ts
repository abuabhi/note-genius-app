
import { FlashcardState } from './types';
import { 
  fetchBuiltInSets as fetchLibrarySets, 
  cloneFlashcardSet as cloneSet
} from './operations/libraryOperations';

/**
 * Hook that provides library-related operations for flashcards
 */
export const useLibraryOperations = (state: FlashcardState) => {
  // Wrapper functions to pass state
  const fetchBuiltInSets = () => fetchLibrarySets(state);
  const cloneFlashcardSet = (setId: string) => cloneSet(state, setId);

  return {
    fetchBuiltInSets,
    cloneFlashcardSet,
  };
};
