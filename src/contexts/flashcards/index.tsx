
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
        try {
          await operations.fetchFlashcardSets();
        } catch (error) {
          // Silent fail - sets will be empty
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

  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};

// Export modern hooks for components that want to use them directly
export { useFlashcardSets } from '@/hooks/flashcards/useFlashcardSets';
export { useFlashcards as useFlashcardsHook } from '@/hooks/flashcards/useFlashcards';
export { useFlashcardStudy } from '@/hooks/flashcards/useFlashcardStudy';
export { useQueryOptimization } from '@/hooks/query/useQueryOptimization';
export { useIntelligentPrefetch } from '@/hooks/query/useIntelligentPrefetch';
