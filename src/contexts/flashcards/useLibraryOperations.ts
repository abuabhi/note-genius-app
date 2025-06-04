
import { useCallback } from 'react';
import { FlashcardState } from './types';
import { FlashcardSet } from '@/types/flashcard';
import { searchLibrary, copySetFromLibrary, cloneFlashcardSet, fetchBuiltInSets } from './operations/libraryOperations';

/**
 * Hook that provides library-related operations for flashcards
 */
export const useLibraryOperations = (state: FlashcardState) => {
  
  const handleSearchLibrary = useCallback(async (query: string): Promise<FlashcardSet[]> => {
    return searchLibrary(query);
  }, []);

  const handleCopySetFromLibrary = useCallback(async (setId: string): Promise<FlashcardSet | null> => {
    const simpleSetter = (sets: FlashcardSet[]) => {
      state.setFlashcardSets(sets);
    };
    return copySetFromLibrary(state.user, simpleSetter, setId);
  }, [state.user, state.setFlashcardSets]);

  const handleCloneFlashcardSet = useCallback(async (setId: string): Promise<FlashcardSet | null> => {
    const simpleSetter = (sets: FlashcardSet[]) => {
      state.setFlashcardSets(sets);
    };
    return cloneFlashcardSet(state.user, simpleSetter, setId);
  }, [state.user, state.setFlashcardSets]);

  const handleFetchBuiltInSets = useCallback(async (): Promise<FlashcardSet[]> => {
    return fetchBuiltInSets();
  }, []);

  return {
    searchLibrary: handleSearchLibrary,
    copySetFromLibrary: handleCopySetFromLibrary,
    cloneFlashcardSet: handleCloneFlashcardSet,
    fetchBuiltInSets: handleFetchBuiltInSets
  };
};
