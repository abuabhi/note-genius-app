import React, { createContext, useContext, useEffect } from 'react';
import { FlashcardState, FlashcardContextType, FlashcardProviderProps } from './types';
import { useFlashcardState } from './useFlashcardState';
import { combineFlashcardOperations } from './useFlashcards';

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};

export const FlashcardProvider: React.FC<FlashcardProviderProps> = ({ children }) => {
  const state = useFlashcardState();
  const operations = combineFlashcardOperations(state);

  // Auto-fetch flashcard sets on mount when user is available and no sets exist
  useEffect(() => {
    if (state.user && state.flashcardSets.length === 0 && !state.loading.sets) {
      operations.fetchFlashcardSets().catch(console.error);
    }
  }, [state.user, state.flashcardSets.length, state.loading.sets, operations]);

  const contextValue: FlashcardContextType = {
    ...state,
    ...operations,
    isLoading: state.loading.flashcards || state.loading.sets || state.loading.userSubjects,
    isReady: state.user !== null && !state.loading.sets,
  };

  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};