
import { useCallback } from 'react';
import { FlashcardState } from './types';
import { FlashcardSet } from '@/types/flashcard';
import { 
  searchLibrary, 
  copySetFromLibrary, 
  cloneFlashcardSet, 
  fetchBuiltInSets,
  SimpleFlashcardSet,
  UpdateSetsCallback,
  GetSetsCallback
} from './operations/libraryOperations';

/**
 * Hook that provides library-related operations for flashcards
 */
export const useLibraryOperations = (state: FlashcardState) => {
  
  const handleSearchLibrary = useCallback(async (query: string): Promise<FlashcardSet[]> => {
    const results = await searchLibrary(query);
    // Convert SimpleFlashcardSet to FlashcardSet
    return results.map(set => ({
      ...set,
      subject_categories: undefined // This field doesn't exist in the database
    }));
  }, []);

  const handleCopySetFromLibrary = useCallback(async (setId: string): Promise<FlashcardSet | null> => {
    const getCurrentSets: GetSetsCallback = () => state.flashcardSets;
    const updateSets: UpdateSetsCallback = (newSets: SimpleFlashcardSet[]) => {
      // Convert SimpleFlashcardSet back to FlashcardSet for state
      const convertedSets = newSets.map(set => ({
        ...set,
        subject_categories: undefined
      }));
      state.setFlashcardSets(convertedSets);
    };
    
    const result = await copySetFromLibrary(state.user, getCurrentSets, updateSets, setId);
    if (result) {
      return {
        ...result,
        subject_categories: undefined
      };
    }
    return null;
  }, [state.user, state.flashcardSets, state.setFlashcardSets]);

  const handleCloneFlashcardSet = useCallback(async (setId: string): Promise<FlashcardSet | null> => {
    const getCurrentSets: GetSetsCallback = () => state.flashcardSets;
    const updateSets: UpdateSetsCallback = (newSets: SimpleFlashcardSet[]) => {
      const convertedSets = newSets.map(set => ({
        ...set,
        subject_categories: undefined
      }));
      state.setFlashcardSets(convertedSets);
    };
    
    const result = await cloneFlashcardSet(state.user, getCurrentSets, updateSets, setId);
    if (result) {
      return {
        ...result,
        subject_categories: undefined
      };
    }
    return null;
  }, [state.user, state.flashcardSets, state.setFlashcardSets]);

  const handleFetchBuiltInSets = useCallback(async (): Promise<FlashcardSet[]> => {
    const results = await fetchBuiltInSets();
    return results.map(set => ({
      ...set,
      subject_categories: undefined
    }));
  }, []);

  return {
    searchLibrary: handleSearchLibrary,
    copySetFromLibrary: handleCopySetFromLibrary,
    cloneFlashcardSet: handleCloneFlashcardSet,
    fetchBuiltInSets: handleFetchBuiltInSets
  };
};
