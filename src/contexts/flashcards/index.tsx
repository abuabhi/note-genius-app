
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
  
  // Auto-load flashcard sets when provider mounts
  useEffect(() => {
    const loadInitialData = async () => {
      if (state.user && state.flashcardSets.length === 0) {
        console.log('FlashcardProvider: Auto-loading flashcard sets...');
        try {
          await operations.fetchFlashcardSets();
          console.log('FlashcardProvider: Successfully loaded sets:', state.flashcardSets.length);
        } catch (error) {
          console.error('FlashcardProvider: Failed to load initial data:', error);
        }
      }
      setIsReady(true);
    };

    loadInitialData();
  }, [state.user?.id]);
  
  const contextValue: FlashcardContextType = {
    ...state,
    ...operations,
    isLoading: state.loading.flashcards || state.loading.sets || state.loading.userSubjects,
    isReady,
  };

  console.log('FlashcardProvider: Rendering with context value', {
    flashcardSetsCount: state.flashcardSets.length,
    userSubjectsCount: state.userSubjects.length,
    currentSetId: state.currentSet?.id,
    userId: state.user?.id,
    isReady,
    loading: contextValue.isLoading
  });

  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};
