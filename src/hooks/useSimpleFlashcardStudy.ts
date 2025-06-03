
import { useState, useEffect, useCallback } from "react";
import { Flashcard } from "@/types/flashcard";
import { StudyMode } from "@/pages/study/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface UseSimpleFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const useSimpleFlashcardStudy = ({ setId, mode }: UseSimpleFlashcardStudyProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [error, setError] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { user } = useAuth();

  // Simple direct flashcard loading
  const loadFlashcards = useCallback(async () => {
    if (!setId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Simple flashcard loading for set:", setId);
      
      // Direct query to get flashcards in the set
      const { data: setCards, error: setCardsError } = await supabase
        .from('flashcard_set_cards')
        .select(`
          position,
          flashcard:flashcards(
            id,
            front_content,
            back_content,
            difficulty,
            created_at,
            updated_at
          )
        `)
        .eq('set_id', setId)
        .order('position');

      if (setCardsError) {
        throw setCardsError;
      }

      if (!setCards || setCards.length === 0) {
        setError("No flashcards found in this set");
        setFlashcards([]);
        return;
      }

      // Map to flashcard format
      const cards: Flashcard[] = setCards
        .filter(item => item.flashcard)
        .map((item, index) => ({
          id: item.flashcard.id,
          front: item.flashcard.front_content,
          back: item.flashcard.back_content,
          front_content: item.flashcard.front_content,
          back_content: item.flashcard.back_content,
          position: item.position || index,
          difficulty: item.flashcard.difficulty,
          created_at: item.flashcard.created_at,
          updated_at: item.flashcard.updated_at
        }));

      // Simple sorting based on mode
      let sortedCards = [...cards];
      if (mode === "review") {
        sortedCards.sort((a, b) => (a.position || 0) - (b.position || 0));
      } else if (mode === "test") {
        // Fisher-Yates shuffle for test mode
        for (let i = sortedCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sortedCards[i], sortedCards[j]] = [sortedCards[j], sortedCards[i]];
        }
      } else {
        sortedCards.sort((a, b) => (a.position || 0) - (b.position || 0));
      }

      console.log("Loaded flashcards:", sortedCards);
      setFlashcards(sortedCards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setForceUpdate(prev => prev + 1);
      
    } catch (error) {
      console.error("Error loading flashcards:", error);
      setError("Failed to load flashcards");
      toast.error("Failed to load flashcards");
    } finally {
      setIsLoading(false);
    }
  }, [setId, mode]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const handleNext = useCallback(() => {
    if (flashcards.length === 0) return;
    
    setDirection("right");
    setIsFlipped(false);
    const nextIndex = (currentIndex + 1) % flashcards.length;
    setCurrentIndex(nextIndex);
    setForceUpdate(prev => prev + 1);
  }, [currentIndex, flashcards.length]);
  
  const handlePrevious = useCallback(() => {
    if (flashcards.length === 0) return;
    
    setDirection("left");
    setIsFlipped(false);
    const prevIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    setCurrentIndex(prevIndex);
    setForceUpdate(prev => prev + 1);
  }, [currentIndex, flashcards.length]);
  
  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Simple review recording
  const handleScoreCard = useCallback(async (score: number) => {
    if (!user || flashcards.length === 0) return;
    
    const flashcard = flashcards[currentIndex];
    
    try {
      // Record the review directly
      const { error } = await supabase
        .from('user_flashcard_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: flashcard.id,
          last_reviewed_at: new Date().toISOString(),
          last_score: score,
          repetition: 1,
          ease_factor: score >= 3 ? 2.5 : 2.0,
          interval: score >= 3 ? 1 : 0
        });

      if (error) throw error;
      
      handleNext();
    } catch (error) {
      console.error("Error recording review:", error);
      toast.error("Failed to save your progress");
    }
  }, [user, flashcards, currentIndex, handleNext]);

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    direction,
    error,
    forceUpdate,
    handleNext,
    handlePrevious,
    handleFlip,
    handleScoreCard,
    setIsFlipped
  };
};
