
import React, { createContext, useContext, useState } from 'react';
import { FlashcardContextType, FlashcardProviderProps, FlashcardState } from './types';
import { FlashcardSet, Flashcard, SubjectCategory } from '@/types/flashcard';
import { useFlashcardsOperations } from './useFlashcards';
import { useAuth } from '@/contexts/auth';

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};

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
  const operations = useFlashcardsOperations(state);

  return (
    <FlashcardContext.Provider
      value={{
        flashcards,
        flashcardSets,
        currentFlashcard,
        currentSet,
        categories,
        setCategories,
        loading,
        ...operations,
        setCurrentFlashcard,
        setCurrentSet
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
};
