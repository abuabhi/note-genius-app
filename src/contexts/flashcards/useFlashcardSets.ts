import { FlashcardState } from './types';
import { 
  fetchFlashcardSets as fetchSets, 
  fetchCategories as fetchCats
} from './operations/fetchOperations';
import {
  createFlashcardSet as createSet,
  updateFlashcardSet as updateSet,
  deleteFlashcardSet as deleteSet
} from './operations/mutationOperations';

export const useFlashcardSets = (state: FlashcardState) => {
  // Wrapper functions to pass state
  const fetchFlashcardSets = () => fetchSets(state);
  const createFlashcardSet = (setData) => createSet(state, setData);
  const updateFlashcardSet = (id, setData) => updateSet(state, id, setData);
  const deleteFlashcardSet = (id) => deleteSet(state, id);
  const fetchCategories = () => fetchCats(state);
  
  // For backward compatibility, keep the function to fetch built-in sets
  const fetchBuiltInSets = async () => {
    // This function has been moved to useLibraryOperations
    // but we keep it here for backward compatibility
    return [];
  };

  return {
    fetchFlashcardSets,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    fetchBuiltInSets,
    fetchCategories
  };
};
