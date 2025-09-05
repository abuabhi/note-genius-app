import React, { createContext, useContext, ReactNode } from 'react';
import { useFlashcardSets } from '@/hooks/flashcards/useFlashcardSets';
import { useFlashcards } from '@/hooks/flashcards/useFlashcards';
import { useFlashcardStudy } from '@/hooks/flashcards/useFlashcardStudy';
import { useQueryOptimization } from '@/hooks/query/useQueryOptimization';

interface FlashcardContextType {
  // Flashcard Sets
  flashcardSets: any[];
  builtInSets: any[];
  allSets: any[];
  isLoadingSets: boolean;
  createFlashcardSet: (setData: any) => void;
  updateFlashcardSet: (id: string, updates: any) => void;
  deleteFlashcardSet: (id: string) => void;
  
  // Factory functions for component-specific data
  getFlashcards: (setId?: string) => any;
  getStudyProgress: (flashcardId?: string) => any;
  
  // Query Optimization
  prefetchRelatedQueries: (queryKey: readonly unknown[]) => void;
  invalidateFlashcardQueries: (setId?: string) => void;
  
  // Loading states
  isLoading: boolean;
  isReady: boolean;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const useFlashcardsContext = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcardsContext must be used within a FlashcardProvider');
  }
  return context;
};

interface FlashcardProviderProps {
  children: ReactNode;
}

export const FlashcardProvider: React.FC<FlashcardProviderProps> = ({ children }) => {
  // Core hooks
  const flashcardSetsHook = useFlashcardSets();
  const queryOptimization = useQueryOptimization();

  // Factory functions for component-specific data
  const getFlashcards = (setId?: string) => {
    // This will be called by components that need flashcard data
    // React hooks rules are maintained because this is called within components
    return useFlashcards(setId);
  };

  const getStudyProgress = (flashcardId?: string) => {
    // This will be called by components that need study progress data
    return useFlashcardStudy(flashcardId);
  };

  const contextValue: FlashcardContextType = {
    // Flashcard Sets (always available)
    ...flashcardSetsHook,
    
    // Factory functions for component-specific data
    getFlashcards,
    getStudyProgress,
    
    // Query optimization
    prefetchRelatedQueries: queryOptimization.prefetchRelatedQueries,
    invalidateFlashcardQueries: queryOptimization.invalidateFlashcardQueries,
    
    // Computed loading state
    isLoading: flashcardSetsHook.isLoading,
    isReady: !flashcardSetsHook.isLoading,
  };

  console.log('🃏 [FlashcardProvider] Rendering with:', {
    flashcardSetsCount: flashcardSetsHook.flashcardSets.length,
    builtInSetsCount: flashcardSetsHook.builtInSets.length,
    isLoading: flashcardSetsHook.isLoading,
    isReady: !flashcardSetsHook.isLoading,
  });

  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};