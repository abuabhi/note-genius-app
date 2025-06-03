
import { useState, useEffect, useRef, useCallback } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Flashcard } from "@/types/flashcard";
import { StudyMode } from "@/pages/study/types";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface UseFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const useFlashcardStudy = ({ setId, mode }: UseFlashcardStudyProps) => {
  const { fetchFlashcardsInSet, recordFlashcardReview } = useFlashcards();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { user } = useRequireAuth();
  
  // Use refs to track loading state and prevent multiple concurrent loads
  const isLoadingRef = useRef(false);
  const lastLoadedSetId = useRef<string | null>(null);
  const lastLoadedMode = useRef<StudyMode | null>(null);

  useEffect(() => {
    const loadFlashcards = async () => {
      // Prevent multiple concurrent loads and avoid reloading same data
      if (isLoadingRef.current || 
          (lastLoadedSetId.current === setId && lastLoadedMode.current === mode)) {
        return;
      }
      
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("useFlashcardStudy: Loading flashcards for set:", setId, "mode:", mode);
        const cards = await fetchFlashcardsInSet(setId);
        console.log("useFlashcardStudy: Loaded flashcards:", cards);
        
        if (!cards || cards.length === 0) {
          setError("No flashcards found in this set");
          setFlashcards([]);
          return;
        }
        
        // Sort cards based on mode and position
        let sortedCards = [...cards];
        
        if (mode === "review") {
          sortedCards.sort((a, b) => {
            if (a.position !== undefined && b.position !== undefined) {
              if (a.position !== b.position) {
                return a.position - b.position;
              }
            }
            if (!a.next_review_at) return -1;
            if (!b.next_review_at) return 1;
            return new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime();
          });
        } else if (mode === "test") {
          sortedCards.sort((a, b) => {
            if (a.position !== undefined && b.position !== undefined) {
              return a.position - b.position;
            }
            return 0;
          });
          
          // Fisher-Yates shuffle
          for (let i = sortedCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sortedCards[i], sortedCards[j]] = [sortedCards[j], sortedCards[i]];
          }
        } else {
          sortedCards.sort((a, b) => {
            if (a.position !== undefined && b.position !== undefined) {
              return a.position - b.position;
            }
            return 0;
          });
        }
        
        console.log("useFlashcardStudy: Final sorted cards:", sortedCards);
        
        setFlashcards(sortedCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setStreak(0);
        setForceUpdate(prev => prev + 1);
        
        // Mark as successfully loaded
        lastLoadedSetId.current = setId;
        lastLoadedMode.current = mode;
      } catch (error) {
        console.error("useFlashcardStudy: Error loading flashcards:", error);
        setError("Failed to load flashcards");
        toast.error("Failed to load flashcards");
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    // Only load if we have a setId and it's different from what's loaded
    if (setId && (lastLoadedSetId.current !== setId || lastLoadedMode.current !== mode)) {
      loadFlashcards();
    } else if (setId === lastLoadedSetId.current && mode === lastLoadedMode.current) {
      // Data already loaded for this set and mode
      setIsLoading(false);
    }
  }, [setId, mode, fetchFlashcardsInSet]);

  const handleNext = () => {
    if (flashcards.length === 0) return;
    
    setDirection("right");
    setIsFlipped(false);
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setCurrentIndex(nextIndex);
    setForceUpdate(prev => prev + 1);
  };
  
  const handlePrevious = () => {
    if (flashcards.length === 0) return;
    
    setDirection("left");
    setIsFlipped(false);
    const prevIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    setCurrentIndex(prevIndex);
    setForceUpdate(prev => prev + 1);
  };
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleScoreCard = async (score: number) => {
    if (!user || flashcards.length === 0) return;
    
    const flashcard = flashcards[currentIndex];
    
    try {
      await recordFlashcardReview(flashcard.id, score as 0 | 1 | 2 | 3 | 4 | 5);
      
      if (score >= 3) {
        setStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak % 5 === 0) {
            toast.success(`Streak of ${newStreak}! Keep going!`);
          }
          return newStreak;
        });
      } else {
        setStreak(0);
      }
      
      handleNext();
    } catch (error) {
      console.error("Error recording review:", error);
      toast.error("Failed to save your progress");
    }
  };

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    direction,
    streak,
    error,
    forceUpdate,
    handleNext,
    handlePrevious,
    handleFlip,
    handleScoreCard,
    setIsFlipped
  };
};
