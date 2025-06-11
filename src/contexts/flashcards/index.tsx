import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
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
  const [isReady, setIsReady] = useState(false);

  const { user, loading: authLoading } = useAuth();

  // Enhanced authentication debugging
  useEffect(() => {
    console.log('FlashcardProvider: Authentication state changed', {
      user: user ? { id: user.id, email: user.email } : null,
      authLoading,
      timestamp: new Date().toISOString()
    });

    // Mark provider as ready when auth is no longer loading
    if (!authLoading) {
      setIsReady(true);
      console.log('FlashcardProvider: Marked as ready, user:', user?.id || 'none');
    }
  }, [user, authLoading]);

  // Stable loading setter using useCallback
  const stableSetLoading = useCallback((newLoading: typeof loading | ((prev: typeof loading) => typeof loading)) => {
    setLoading(newLoading);
  }, []);

  // Enhanced setFlashcardSets with user validation and immediate state update - STABILIZED
  const enhancedSetFlashcardSets = useCallback((sets: FlashcardSet[] | ((prev: FlashcardSet[]) => FlashcardSet[])) => {
    if (!user) {
      console.warn('FlashcardProvider: Attempted to set flashcard sets without authenticated user');
      return;
    }
    
    setFlashcardSets(prev => {
      const newSets = typeof sets === 'function' ? sets(prev) : sets;
      console.log('FlashcardProvider: Setting flashcard sets', {
        userId: user.id,
        setsCount: newSets.length,
        sets: newSets.map(s => ({ id: s.id.slice(0, 8), name: s.name, user_id: s.user_id }))
      });
      return newSets;
    });
  }, [user]);

  // Stabilized setters with useCallback
  const stableSetFlashcards = useCallback((flashcards: Flashcard[] | ((prev: Flashcard[]) => Flashcard[])) => {
    setFlashcards(flashcards);
  }, []);

  const stableSetCurrentFlashcard = useCallback((flashcard: Flashcard | null) => {
    setCurrentFlashcard(flashcard);
  }, []);

  const stableSetCurrentSet = useCallback((set: FlashcardSet | null) => {
    setCurrentSet(set);
  }, []);

  const stableSetCategories = useCallback((categories: SubjectCategory[] | ((prev: SubjectCategory[]) => SubjectCategory[])) => {
    setCategories(categories);
  }, []);

  // Create state object for hooks to share with enhanced user validation - STABILIZED
  const state: FlashcardState = useMemo(() => {
    if (!user) {
      console.log('FlashcardProvider: No user available for state creation');
    }
    
    return {
      flashcards,
      flashcardSets,
      currentFlashcard,
      currentSet,
      categories,
      loading,
      setFlashcards: stableSetFlashcards,
      setFlashcardSets: enhancedSetFlashcardSets,
      setCurrentFlashcard: stableSetCurrentFlashcard,
      setCurrentSet: stableSetCurrentSet,
      setCategories: stableSetCategories,
      setLoading: stableSetLoading,
      user
    };
  }, [
    flashcards,
    flashcardSets,
    currentFlashcard,
    currentSet,
    categories,
    loading,
    stableSetFlashcards,
    enhancedSetFlashcardSets,
    stableSetCurrentFlashcard,
    stableSetCurrentSet,
    stableSetCategories,
    stableSetLoading,
    user
  ]);

  // Get all operations from our hooks with stable references
  const flashcardOperations = useFlashcardOperations(state);
  const flashcardSetsOperations = useFlashcardSets(state);
  const categoryOperations = useCategoryOperations(categories, stableSetCategories);
  const libraryOperations = useLibraryOperations(state);
  const studyOperations = useStudyOperations();
  
  // Get combined operations that include recordFlashcardReview and getFlashcardProgress
  const combinedOperations = combineFlashcardOperations(state);

  // Enhanced fetchFlashcardSets that forces a state refresh - STABILIZED
  const enhancedFetchFlashcardSets = useCallback(async () => {
    console.log('FlashcardProvider: Enhanced fetch flashcard sets called');
    try {
      const result = await flashcardSetsOperations.fetchFlashcardSets();
      console.log('FlashcardProvider: Fetch completed, current sets count:', flashcardSets.length);
      return result;
    } catch (error) {
      console.error('FlashcardProvider: Error in enhanced fetch:', error);
      throw error;
    }
  }, [flashcardSetsOperations.fetchFlashcardSets, flashcardSets.length]);

  // Enhanced createFlashcardSet that immediately updates state - STABILIZED
  const enhancedCreateFlashcardSet = useCallback(async (setData: any) => {
    console.log('FlashcardProvider: Enhanced create flashcard set called');
    try {
      const newSet = await flashcardSetsOperations.createFlashcardSet(setData);
      
      // Immediately update the local state to ensure it's fresh
      enhancedSetFlashcardSets(prev => {
        // Check if the set already exists to prevent duplicates
        const exists = prev.some(s => s.id === newSet.id);
        if (exists) {
          console.log('FlashcardProvider: Set already exists in state, not adding duplicate');
          return prev;
        }
        
        console.log('FlashcardProvider: Adding new set to state');
        return [...prev, newSet];
      });
      
      return newSet;
    } catch (error) {
      console.error('FlashcardProvider: Error in enhanced create:', error);
      throw error;
    }
  }, [flashcardSetsOperations.createFlashcardSet, enhancedSetFlashcardSets]);

  // STABILIZED fetchFlashcardsInSet
  const enhancedFetchFlashcardsInSet = useCallback(async (setId: string) => {
    console.log('FlashcardProvider: Enhanced fetch flashcards in set called for:', setId);
    try {
      return await flashcardSetsOperations.fetchFlashcardsInSet(setId);
    } catch (error) {
      console.error('FlashcardProvider: Error in enhanced fetchFlashcardsInSet:', error);
      throw error;
    }
  }, [flashcardSetsOperations.fetchFlashcardsInSet]);

  // Create stable context value with all required properties - STABILIZED
  const contextValue: FlashcardContextType = useMemo(() => ({
    // State properties
    flashcards,
    flashcardSets,
    currentFlashcard,
    currentSet,
    categories,
    loading,
    isReady,
    isLoading: loading.flashcards || loading.sets || loading.categories,
    
    // State setters
    setFlashcards: stableSetFlashcards,
    setFlashcardSets: enhancedSetFlashcardSets,
    setCurrentFlashcard: stableSetCurrentFlashcard,
    setCurrentSet: stableSetCurrentSet,
    setCategories: stableSetCategories,
    setLoading: stableSetLoading,
    user,
    
    // Operations from hooks
    ...flashcardOperations,
    ...categoryOperations,
    ...libraryOperations,
    ...studyOperations,
    recordFlashcardReview: combinedOperations.recordFlashcardReview,
    getFlashcardProgress: combinedOperations.getFlashcardProgress,
    
    // Enhanced operations (override the ones from flashcardSetsOperations)
    fetchFlashcardSets: enhancedFetchFlashcardSets,
    createFlashcardSet: enhancedCreateFlashcardSet,
    updateFlashcardSet: flashcardSetsOperations.updateFlashcardSet,
    deleteFlashcardSet: flashcardSetsOperations.deleteFlashcardSet,
    fetchFlashcardsInSet: enhancedFetchFlashcardsInSet,
  }), [
    flashcards,
    flashcardSets,
    currentFlashcard,
    currentSet,
    categories,
    loading,
    isReady,
    stableSetFlashcards,
    enhancedSetFlashcardSets,
    stableSetCurrentFlashcard,
    stableSetCurrentSet,
    stableSetCategories,
    stableSetLoading,
    user,
    enhancedFetchFlashcardSets,
    enhancedCreateFlashcardSet,
    enhancedFetchFlashcardsInSet,
    flashcardOperations,
    flashcardSetsOperations.updateFlashcardSet,
    flashcardSetsOperations.deleteFlashcardSet,
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

export default FlashcardProvider;
