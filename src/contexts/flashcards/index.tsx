
import React, { createContext, useContext, useState } from 'react';
import { FlashcardContextType, FlashcardProviderProps, FlashcardState } from './types';
import { FlashcardSet, Flashcard, SubjectCategory } from '@/types/flashcard';
import { combineFlashcardOperations } from './useFlashcards';
import { useStudyOperations } from './useStudyOperations';
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

  // Create state object for hooks to share
  const state: FlashcardState = {
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
    setLoading,
    user
  };

  // Get all operations from our hooks
  const operations = combineFlashcardOperations(state);
  const studyOperations = useStudyOperations();

  // Create the context value with all required properties
  const contextValue: FlashcardContextType = {
    flashcards,
    flashcardSets,
    currentFlashcard,
    currentSet,
    categories,
    setCategories,
    loading,
    setCurrentFlashcard,
    setCurrentSet,
    ...operations,
    ...studyOperations
  };

  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};
