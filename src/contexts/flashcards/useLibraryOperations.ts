
import { useCallback } from 'react';
import { FlashcardState } from './types';
import { FlashcardSet } from '@/types/flashcard';
import { 
  searchLibrary, 
  copySetFromLibrary, 
  fetchBuiltInSets,
  cloneFlashcardSet
} from './operations/libraryOperations';

/**
 * Hook that provides library-related operations for flashcards
 */
export const useLibraryOperations = (state: FlashcardState) => {
  
  const handleSearchLibrary = useCallback(async (query: string): Promise<FlashcardSet[]> => {
    return await searchLibrary(state, query);
  }, [state]);

  const handleCopySetFromLibrary = useCallback(async (setId: string): Promise<FlashcardSet | null> => {
    return await copySetFromLibrary(state, setId);
  }, [state]);

  const handleCloneFlashcardSet = useCallback(async (setId: string): Promise<FlashcardSet | null> => {
    return await cloneFlashcardSet(state, setId);
  }, [state]);

  const handleFetchBuiltInSets = useCallback(async (): Promise<FlashcardSet[]> => {
    return await fetchBuiltInSets(state);
  }, [state]);

  return {
    searchLibrary: handleSearchLibrary,
    copySetFromLibrary: handleCopySetFromLibrary,
    cloneFlashcardSet: handleCloneFlashcardSet,
    fetchBuiltInSets: handleFetchBuiltInSets
  };
};
