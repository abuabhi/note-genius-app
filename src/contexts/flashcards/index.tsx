
import React, { createContext, useContext } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { FlashcardContextType, FlashcardProviderProps } from './types';
import { useFlashcardState } from './useFlashcardState';
import { useFlashcardSets } from './useFlashcardSets';
import { useFlashcardsOperations } from './useFlashcards';
import { useStudyOperations } from './useStudyOperations';
import { useCategoryOperations } from './useCategoryOperations';

// Create the context
const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

// FlashcardProvider component
export const FlashcardProvider: React.FC<FlashcardProviderProps> = ({ children }) => {
  const { profile } = useRequireAuth();

  // Get state and operations hooks
  const {
    flashcards, 
    setFlashcards, 
    flashcardSets, 
    setFlashcardSets, 
    categories, 
    setCategories, 
    currentFlashcard, 
    setCurrentFlashcard, 
    currentSet, 
    setCurrentSet, 
    loading, 
    setLoading
  } = useFlashcardState();

  // Initialize operations with state setters
  const { 
    fetchFlashcardSets, 
    createFlashcardSet, 
    updateFlashcardSet, 
    deleteFlashcardSet 
  } = useFlashcardSets(setFlashcardSets, setLoading);

  const {
    fetchFlashcards,
    fetchFlashcardsInSet,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addFlashcardToSet,
    removeFlashcardFromSet
  } = useFlashcardsOperations(setFlashcards, setFlashcardSets, setLoading);

  const { recordFlashcardReview, getFlashcardProgress } = useStudyOperations(profile?.id);
  
  const { fetchCategories } = useCategoryOperations(setCategories, setLoading);

  // Combine everything into the context value
  const contextValue: FlashcardContextType = {
    // Data
    flashcards,
    flashcardSets,
    currentFlashcard,
    currentSet,
    categories,
    loading,
    
    // Operations
    fetchFlashcardSets,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    fetchFlashcardsInSet,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addFlashcardToSet,
    removeFlashcardFromSet,
    recordFlashcardReview,
    getFlashcardProgress,
    fetchCategories,
    
    // State setters
    setCurrentFlashcard,
    setCurrentSet
  };

  return (
    <FlashcardContext.Provider value={contextValue}>
      {children}
    </FlashcardContext.Provider>
  );
};

// Custom hook to use the flashcard context
export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};
