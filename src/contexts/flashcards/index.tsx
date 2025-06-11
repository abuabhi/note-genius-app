
import React, { createContext, useContext, useEffect, useState } from 'react';
import { FlashcardContextType } from './types';
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

export const FlashcardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const state = useFlashcardState();
  const [isReady, setIsReady] = useState(false);
  
  const operations = combineFlashcardOperations(state);
  
  // Mark provider as ready after initial setup
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  const contextValue: FlashcardContextType = {
    ...state,
    ...operations,
    isLoading: state.loading.flashcards || state.loading.sets || state.loading.academicSubjects,
    isReady,
  };

  console.log('FlashcardProvider: Rendering with context value', {
    flashcardSetsCount: state.flashcardSets.length,
    academicSubjectsCount: state.academicSubjects.length,
    currentSetId: state.currentSet?.id,
    userId: state.user?.id,
    isReady
  });

  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};
