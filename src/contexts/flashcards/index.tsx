
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { FlashcardContextType, FlashcardProviderProps, FlashcardState } from './types';
import { FlashcardSet, Flashcard, SubjectCategory } from '@/types/flashcard';
import { useFlashcardOperations } from './useFlashcardOperations';
import { useFlashcardSets } from './useFlashcardSets';
import { useCategoryOperations } from './useCategoryOperations';
import { useLibraryOperations } from './useLibraryOperations';
import { useStudyOperations } from './useStudyOperations';
import { combineFlashcardOperations } from './useFlashcards';
import { useAuth } from '@/contexts/auth';

// Create a context that will hold our flashcard state
const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

// Export a hook that simplifies access to the flashcard context
export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};

// Define the provider that wraps parts of the app that need flashcard functionality
export const FlashcardProvider: React.FC<FlashcardProviderProps> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [categories, setCategories] = useState<SubjectCategory[]>([]);
  const [loading, setLoading] = useState({
    flashcards: false,
    sets: false,
    categories: false
  });

  const { user } = useAuth();

  // Stable loading setter using useCallback
  const stableSetLoading = useCallback((newLoading: typeof loading | ((prev: typeof loading) => typeof loading)) => {
    setLoading(newLoading);
  }, []);

  // Create state object for hooks to share
  const state: FlashcardState = useMemo(() => ({
    flashcards,
    flashcardSets,
    currentFlashcard,
    currentSet,
    categories,
    loading,
    setFlashcards,
    setFlashcardSets,
    setCurrentFlashcard,
    setCurrentSet,
    setCategories,
    setLoading: stableSetLoading,
    user
  }), [
    flashcards,
    flashcardSets,
    currentFlashcard,
    currentSet,
    categories,
    loading,
    stableSetLoading,
    user
  ]);

  // Get all operations from our hooks with stable references
  const flashcardOperations = useFlashcardOperations(state);
  const flashcardSetsOperations = useFlashcardSets(state);
  const categoryOperations = useCategoryOperations(categories, setCategories);
  const libraryOperations = useLibraryOperations(state);
  const studyOperations = useStudyOperations();
  
  // Get combined operations that include recordFlashcardReview and getFlashcardProgress
  const combinedOperations = combineFlashcardOperations(state);

  // Create stable context value with all required properties
  const contextValue: FlashcardContextType = useMemo(() => ({
    flashcards,
    flashcardSets,
    currentFlashcard,
    currentSet,
    categories,
    setCategories,
    loading,
    setCurrentFlashcard,
    setCurrentSet,
    ...flashcardOperations,
    ...flashcardSetsOperations,
    ...categoryOperations,
    ...libraryOperations,
    ...studyOperations,
    recordFlashcardReview: combinedOperations.recordFlashcardReview,
    getFlashcardProgress: combinedOperations.getFlashcardProgress
  }), [
    flashcards,
    flashcardSets,
    currentFlashcard,
    currentSet,
    categories,
    loading,
    flashcardOperations,
    flashcardSetsOperations,
    categoryOperations,
    libraryOperations,
    studyOperations,
    combinedOperations.recordFlashcardReview,
    combinedOperations.getFlashcardProgress
  ]);

  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};
