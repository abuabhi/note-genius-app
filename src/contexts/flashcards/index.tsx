
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
  const categoryOperations = useCategoryOperations(state.categories, state.setCategories);
  
  // Combine all operations
  const contextValue: FlashcardContextType = {
    ...state,
    ...flashcardOperations,
    ...setOperations,
    ...studyOperations,
    ...categoryOperations,
    fetchBuiltInSets: async () => {
      // Implementation for fetchBuiltInSets if missing
      try {
        const builtInSets = await flashcardOperations.fetchBuiltInSets();
        return builtInSets;
      } catch (error) {
        console.error('Error fetching built-in sets:', error);
        return [];
      }
    },
    cloneFlashcardSet: async (setId: string) => {
      // Implementation for cloneFlashcardSet if missing
      try {
        return await flashcardOperations.cloneFlashcardSet(setId);
      } catch (error) {
        console.error('Error cloning flashcard set:', error);
        throw error;
      }
    }
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
