import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
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
  
  // Update loading state for categories using useEffect to prevent infinite re-renders
  useEffect(() => {
    state.setLoading(prevLoading => ({
      ...prevLoading,
      categories: categoriesLoading
    }));
  }, [categoriesLoading, state.setLoading]);
  
  // Add these missing methods to your FlashcardContextProvider component:
  const recordFlashcardReview = async (flashcardId: string, score: number) => {
    // Implementation goes here
    console.log("Recording flashcard review:", flashcardId, score);
  };

  const getFlashcardProgress = async (flashcardId: string) => {
    // Implementation goes here
    return { success: true, data: { repetition: 0, ease_factor: 2.5 } };
  };

  // Combine all operations
  const contextValue: FlashcardContextType = {
    ...state,
    ...flashcardOperations,
    ...setOperations,
    ...studyOperations,
    fetchCategories,
    recordFlashcardReview,
    getFlashcardProgress,
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
