
import React, { createContext, useContext } from 'react';
import { FlashcardContextType, FlashcardProviderProps } from './types';
import { useFlashcardState } from './useFlashcardState';
import { useFlashcardsOperations } from './useFlashcards';
import { useFlashcardSets } from './useFlashcardSets';
import { useStudyOperations } from './useStudyOperations';
import { useCategoryOperations } from './useCategoryOperations';

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider: React.FC<FlashcardProviderProps> = ({ children }) => {
  // Initialize state
  const state = useFlashcardState();
  
  // Get operations
  const flashcardOperations = useFlashcardsOperations(state);
  const setOperations = useFlashcardSets(state);
  const studyOperations = useStudyOperations(state);
  const { fetchCategories, categoriesLoading } = useCategoryOperations(state.categories, state.setCategories);
  
  // Update loading state for categories
  state.setLoading(prevLoading => ({
    ...prevLoading,
    categories: categoriesLoading
  }));
  
  // Combine all operations
  const contextValue: FlashcardContextType = {
    ...state,
    ...flashcardOperations,
    ...setOperations,
    ...studyOperations,
    fetchCategories,
  };
  
  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};
