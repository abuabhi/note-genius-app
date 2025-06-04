
import { useState, useEffect, useCallback } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { Flashcard } from "@/types/flashcard";
import { StudyMode } from "@/pages/study/types";
import { toast } from "sonner";

interface UseSimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const useSimplifiedFlashcardStudy = ({ setId, mode }: UseSimplifiedFlashcardStudyProps) => {
  const { fetchFlashcardsInSet } = useFlashcards();
  const { progressMap, fetchLearningProgress } = useLearningProgress();
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [studiedToday, setStudiedToday] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  // Load flashcards based on mode
  const loadFlashcards = useCallback(async () => {
    if (!setId) return;
    
    console.log("useSimplifiedFlashcardStudy: Loading flashcards for setId:", setId, "mode:", mode);
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all flashcards in the set first
      const allCards = await fetchFlashcardsInSet(setId);
      console.log("useSimplifiedFlashcardStudy: Fetched cards:", allCards?.length || 0);
      
      if (!allCards || allCards.length === 0) {
        setError("No flashcards found in this set");
        setFlashcards([]);
        setIsLoading(false);
        return;
      }

      // For learn mode, show all cards
      if (mode === "learn") {
        const validCards = allCards.filter(card => {
          const hasValidContent = (card.front_content || card.front) && (card.back_content || card.back);
          if (!hasValidContent) {
            console.warn("useSimplifiedFlashcardStudy: Card missing content:", card.id);
          }
          return hasValidContent;
        });
        
        if (validCards.length === 0) {
          setError("No valid flashcards with content found");
          setFlashcards([]);
          setIsLoading(false);
          return;
        }
        
        console.log("useSimplifiedFlashcardStudy: Valid cards loaded for learn mode:", validCards.length);
        setFlashcards(validCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsComplete(false);
        setIsLoading(false);
        return;
      }

      // For review mode, fetch progress and filter cards
      if (mode === "review") {
        const cardIds = allCards.map(card => card.id);
        await fetchLearningProgress(cardIds);
        
        // Filter cards that need practice after progress is loaded
        const filteredCards = allCards.filter(card => {
          const progress = progressMap.get(card.id);
          
          // Cards need review if:
          // 1. Never seen before
          // 2. Marked as difficult
          // 3. Low success rate (less than 70%)
          if (!progress || !progress.last_seen_at) {
            return true; // Never seen
          }
          
          if (progress.is_difficult) {
            return true; // Marked as difficult
          }
          
          const successRate = progress.times_seen > 0 
            ? (progress.times_correct / progress.times_seen) * 100 
            : 0;
            
          return successRate < 70; // Low success rate
        });
        
        console.log("useSimplifiedFlashcardStudy: Filtered cards for review:", filteredCards.length);
        
        if (filteredCards.length === 0) {
          setError("No cards need review at this time. Great job!");
          setFlashcards([]);
          setIsLoading(false);
          return;
        }

        // Ensure all cards have the required content fields
        const validCards = filteredCards.filter(card => {
          const hasValidContent = (card.front_content || card.front) && (card.back_content || card.back);
          if (!hasValidContent) {
            console.warn("useSimplifiedFlashcardStudy: Card missing content:", card.id);
          }
          return hasValidContent;
        });
        
        if (validCards.length === 0) {
          setError("No valid flashcards with content found");
          setFlashcards([]);
          setIsLoading(false);
          return;
        }
        
        console.log("useSimplifiedFlashcardStudy: Valid cards loaded for review mode:", validCards.length);
        setFlashcards(validCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsComplete(false);
      }
      
    } catch (err) {
      console.error("useSimplifiedFlashcardStudy: Error loading flashcards:", err);
      setError("Failed to load flashcards. Please try again.");
      setFlashcards([]);
    } finally {
      setIsLoading(false);
    }
  }, [setId, mode, fetchFlashcardsInSet, fetchLearningProgress]);

  // Load flashcards when dependencies change, but avoid dependency on progressMap
  useEffect(() => {
    loadFlashcards();
  }, [setId, mode, fetchFlashcardsInSet, fetchLearningProgress]);

  // Separate effect to handle review mode filtering when progressMap updates
  useEffect(() => {
    if (mode === "review" && flashcards.length === 0 && !isLoading && progressMap.size > 0) {
      // Re-trigger loading if we're in review mode and progressMap has been populated
      loadFlashcards();
    }
  }, [mode, flashcards.length, isLoading, progressMap.size, loadFlashcards]);

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
    console.log("useSimplifiedFlashcardStudy: Card choice:", choice, "for card:", currentCard?.id);
    
    if (choice === 'mastered') {
      setMasteredCount(prev => prev + 1);
    }
    
    setStudiedToday(prev => prev + 1);
    
    // Move to next card or complete
    setTimeout(() => {
      handleNext();
    }, 500);
  }, [handleNext]);

  // Get current card safely
  const currentCard = flashcards.length > 0 && currentIndex < flashcards.length 
    ? flashcards[currentIndex] 
    : null;

  console.log("useSimplifiedFlashcardStudy: Current state:", {
    flashcardsLength: flashcards.length,
    currentIndex,
    currentCardId: currentCard?.id,
    isLoading,
    error,
    mode
  });

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
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
