
import { useCallback } from 'react';
import { FlashcardState } from './types';
import { FlashcardSet } from '@/types/flashcard';
import { 
  searchLibrary, 
  cloneFlashcardSet, 
  fetchBuiltInSets,
  LibraryFlashcardSet
} from './operations/libraryOperations';

/**
 * Hook that provides library-related operations for flashcards
 */
export const useLibraryOperations = (state: FlashcardState) => {
  
  const handleSearchLibrary = useCallback(async (query: string): Promise<FlashcardSet[]> => {
    const results = await searchLibrary(query);
    // Convert to FlashcardSet format
    return results.map(set => ({
      id: set.id,
      name: set.name,
      description: set.description,
      subject: set.subject,
      topic: set.topic,
      category_id: set.category_id,
      country_id: set.country_id,
      user_id: set.user_id,
      created_at: set.created_at,
      updated_at: set.updated_at,
      card_count: set.card_count,
      is_built_in: set.is_built_in
    }));
  }, []);

  const handleCopySetFromLibrary = useCallback(async (setId: string): Promise<FlashcardSet | null> => {
    if (!state.user) {
      return null;
    }
    
    const result = await cloneFlashcardSet(state.user.id, setId);
    if (result) {
      // Convert to FlashcardSet and update state
      const newSet: FlashcardSet = {
        id: result.id,
        name: result.name,
        description: result.description,
        subject: result.subject,
        topic: result.topic,
        category_id: result.category_id,
        country_id: result.country_id,
        user_id: result.user_id,
        created_at: result.created_at,
        updated_at: result.updated_at,
        card_count: result.card_count,
        is_built_in: result.is_built_in
      };
      
      // Update the flashcard sets state
      state.setFlashcardSets(prev => [newSet, ...prev]);
      
      return newSet;
    }
    return null;
  }, [state.user, state.setFlashcardSets]);

  const handleCloneFlashcardSet = useCallback(async (setId: string): Promise<FlashcardSet | null> => {
    return handleCopySetFromLibrary(setId);
  }, [handleCopySetFromLibrary]);

  const handleFetchBuiltInSets = useCallback(async (): Promise<FlashcardSet[]> => {
    const results = await fetchBuiltInSets();
    return results.map(set => ({
      id: set.id,
      name: set.name,
      description: set.description,
      subject: set.subject,
      topic: set.topic,
      category_id: set.category_id,
      country_id: set.country_id,
      user_id: set.user_id,
      created_at: set.created_at,
      updated_at: set.updated_at,
      card_count: set.card_count,
      is_built_in: set.is_built_in
    }));
  }, []);

  return {
    searchLibrary: handleSearchLibrary,
    copySetFromLibrary: handleCopySetFromLibrary,
    cloneFlashcardSet: handleCloneFlashcardSet,
    fetchBuiltInSets: handleFetchBuiltInSets
  };
};
