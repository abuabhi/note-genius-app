
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flashcard } from "@/types/flashcard";
import { StudyMode } from "@/pages/study/types";
import { toast } from "sonner";

interface UseOptimizedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const useOptimizedFlashcardStudy = ({ setId, mode }: UseOptimizedFlashcardStudyProps) => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [studiedToday, setStudiedToday] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  // Optimized flashcard fetching with caching
  const {
    data: flashcards = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['flashcards', setId, mode],
    queryFn: async () => {
      console.log("useOptimizedFlashcardStudy: Fetching flashcards for setId:", setId, "mode:", mode);
      
      const { data: setCards, error: setCardsError } = await supabase
        .from('flashcard_set_cards')
        .select(`
          flashcard_id,
          position,
          flashcards (
            id,
            front_content,
            back_content,
            difficulty,
            created_at,
            updated_at,
            user_id,
            is_built_in,
            last_reviewed_at,
            next_review_at
          )
        `)
        .eq('set_id', setId)
        .order('position', { ascending: true });

      if (setCardsError) {
        console.error("useOptimizedFlashcardStudy: Error fetching flashcards:", setCardsError);
        throw setCardsError;
      }

      if (!setCards || setCards.length === 0) {
        console.log("useOptimizedFlashcardStudy: No flashcards found in set:", setId);
        return [];
      }

      const flashcards: Flashcard[] = setCards
        .filter(card => card.flashcards)
        .map(card => {
          const flashcard = card.flashcards;
          return {
            id: flashcard.id,
            front_content: flashcard.front_content,
            back_content: flashcard.back_content,
            front: flashcard.front_content,
            back: flashcard.back_content,
            set_id: setId,
            difficulty: flashcard.difficulty,
            created_at: flashcard.created_at,
            updated_at: flashcard.updated_at,
            user_id: flashcard.user_id,
            is_built_in: flashcard.is_built_in,
            last_reviewed_at: flashcard.last_reviewed_at,
            next_review_at: flashcard.next_review_at,
            position: card.position
          };
        });

      console.log("useOptimizedFlashcardStudy: Loaded flashcards:", flashcards.length);
      return flashcards;
    },
    enabled: !!setId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Preload next few cards for better performance
  const preloadedCards = useMemo(() => {
    const startIndex = Math.max(0, currentIndex - 1);
    const endIndex = Math.min(flashcards.length, currentIndex + 4);
    return flashcards.slice(startIndex, endIndex);
  }, [flashcards, currentIndex]);

  // Get current card safely with memoization - MOVED UP BEFORE USAGE
  const currentCard = useMemo(() => {
    return flashcards.length > 0 && currentIndex < flashcards.length 
      ? flashcards[currentIndex] 
      : null;
  }, [flashcards, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, flashcards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleCardChoice = useCallback((choice: 'mastered' | 'needs_practice') => {
    console.log("useOptimizedFlashcardStudy: Card choice:", choice, "for card:", currentCard?.id);
    
    if (choice === 'mastered') {
      setMasteredCount(prev => prev + 1);
    }
    
    setStudiedToday(prev => prev + 1);
    
    // Optimistically update progress in background
    if (currentCard) {
      // Background update without blocking UI
      setTimeout(() => {
        // This could trigger a background mutation to update progress
        queryClient.invalidateQueries({ queryKey: ['learning-progress', currentCard.id] });
      }, 100);
    }
    
    setTimeout(() => {
      handleNext();
    }, 500);
  }, [currentCard, handleNext, queryClient]);

  console.log("useOptimizedFlashcardStudy: Current state:", {
    flashcardsLength: flashcards.length,
    currentIndex,
    currentCardId: currentCard?.id,
    isLoading,
    error: error?.message,
    mode
  });

  return {
    flashcards: preloadedCards, // Return preloaded subset for better performance
    allFlashcards: flashcards, // Full set available if needed
    currentIndex,
    isFlipped,
    isLoading,
    error: error?.message || null,
    isComplete,
    currentCard,
    totalCards: flashcards.length,
    studiedToday,
    masteredCount,
    handleNext,
    handlePrevious,
    handleFlip,
    handleCardChoice,
    setIsFlipped
  };
};
