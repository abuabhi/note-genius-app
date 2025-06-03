
import { useState, useEffect, useRef } from "react";
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
  const { user } = useRequireAuth();
  const loadedSetId = useRef<string | null>(null);

  useEffect(() => {
    const loadFlashcards = async () => {
      // Prevent loading the same set multiple times
      if (loadedSetId.current === setId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Loading flashcards for set:", setId);
        const cards = await fetchFlashcardsInSet(setId);
        console.log("Loaded flashcards:", cards);
        console.log("First card:", cards?.[0]);
        
        if (!cards || cards.length === 0) {
          setError("No flashcards found in this set");
          setFlashcards([]);
          return;
        }
        
        // Sort cards based on mode
        let sortedCards = [...cards];
        
        if (mode === "review") {
          sortedCards.sort((a, b) => {
            if (!a.next_review_at) return -1;
            if (!b.next_review_at) return 1;
            return new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime();
          });
        } else if (mode === "test") {
          // Fisher-Yates shuffle
          for (let i = sortedCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sortedCards[i], sortedCards[j]] = [sortedCards[j], sortedCards[i]];
          }
        }
        
        console.log("Sorted cards:", sortedCards);
        console.log("First sorted card:", sortedCards?.[0]);
        
        setFlashcards(sortedCards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setStreak(0);
        loadedSetId.current = setId;
      } catch (error) {
        console.error("Error loading flashcards:", error);
        setError("Failed to load flashcards");
        toast.error("Failed to load flashcards");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (setId) {
      loadFlashcards();
    }
  }, [setId, mode, fetchFlashcardsInSet]);

  const handleNext = () => {
    if (flashcards.length === 0) return;
    
    setDirection("right");
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 200);
  };
  
  const handlePrevious = () => {
    if (flashcards.length === 0) return;
    
    setDirection("left");
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 200);
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
    handleNext,
    handlePrevious,
    handleFlip,
    handleScoreCard,
    setIsFlipped
  };
};
