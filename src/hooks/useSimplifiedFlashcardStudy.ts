
import { useState, useEffect, useCallback } from "react";
import { Flashcard } from "@/types/flashcard";
import { StudyMode } from "@/pages/study/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface UseSimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

interface SimpleProgress {
  flashcard_id: string;
  status: 'needs_practice' | 'mastered';
  review_count: number;
}

export const useSimplifiedFlashcardStudy = ({ setId, mode }: UseSimplifiedFlashcardStudyProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SimpleProgress[]>([]);
  const [studiedToday, setStudiedToday] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const { user } = useAuth();

  // Load flashcards and progress
  const loadData = useCallback(async () => {
    if (!setId || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load flashcards
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

      if (setCardsError) throw setCardsError;

      if (!setCards || setCards.length === 0) {
        setError("No flashcards found in this set");
        return;
      }

      const cards: Flashcard[] = setCards
        .filter(item => item.flashcard)
        .map((item, index) => ({
          id: item.flashcard.id,
          front_content: item.flashcard.front_content,
          back_content: item.flashcard.back_content,
          front: item.flashcard.front_content,
          back: item.flashcard.back_content,
          position: item.position || index,
          difficulty: item.flashcard.difficulty,
          created_at: item.flashcard.created_at,
          updated_at: item.flashcard.updated_at
        }));

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from('simple_flashcard_progress')
        .select('flashcard_id, status, review_count, last_reviewed_at')
        .eq('user_id', user.id)
        .in('flashcard_id', cards.map(c => c.id));

      if (progressError) throw progressError;

      const simpleProgress: SimpleProgress[] = progressData?.map(p => ({
        flashcard_id: p.flashcard_id,
        status: p.status as 'needs_practice' | 'mastered',
        review_count: p.review_count
      })) || [];

      // Filter cards based on mode
      let filteredCards = cards;
      if (mode === "review") {
        // Show only cards that need practice
        const needsPracticeIds = simpleProgress
          .filter(p => p.status === 'needs_practice')
          .map(p => p.flashcard_id);
        filteredCards = cards.filter(c => needsPracticeIds.includes(c.id));
      } else if (mode === "test") {
        // Shuffle for test mode
        filteredCards = [...cards].sort(() => Math.random() - 0.5);
      }

      setFlashcards(filteredCards);
      setProgress(simpleProgress);
      setMasteredCount(simpleProgress.filter(p => p.status === 'mastered').length);
      
      // Count today's reviews
      const today = new Date().toISOString().split('T')[0];
      const todayReviews = progressData?.filter(p => 
        p.last_reviewed_at && p.last_reviewed_at.startsWith(today)
      ).length || 0;
      setStudiedToday(todayReviews);
      
      setCurrentIndex(0);
      setIsFlipped(false);
      
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load flashcards");
      toast.error("Failed to load flashcards");
    } finally {
      setIsLoading(false);
    }
  }, [setId, mode, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCardChoice = useCallback(async (choice: 'needs_practice' | 'mastered') => {
    if (!user || flashcards.length === 0) return;
    
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;
    
    try {
      const { error } = await supabase
        .from('simple_flashcard_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: currentCard.id,
          status: choice,
          last_reviewed_at: new Date().toISOString(),
          review_count: 1 // Will be incremented by database if exists
        }, {
          onConflict: 'user_id,flashcard_id'
        });

      if (error) throw error;
      
      // Update local progress
      setProgress(prev => {
        const existing = prev.find(p => p.flashcard_id === currentCard.id);
        if (existing) {
          return prev.map(p => 
            p.flashcard_id === currentCard.id 
              ? { ...p, status: choice, review_count: p.review_count + 1 }
              : p
          );
        } else {
          return [...prev, { flashcard_id: currentCard.id, status: choice, review_count: 1 }];
        }
      });

      // Update counters
      if (choice === 'mastered') {
        setMasteredCount(prev => prev + 1);
      }
      setStudiedToday(prev => prev + 1);
      
      // Move to next card
      handleNext();
      
    } catch (error) {
      console.error("Error saving progress:", error);
      toast.error("Failed to save progress");
    }
  }, [user, flashcards, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
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

  const getCardProgress = useCallback((cardId: string) => {
    return progress.find(p => p.flashcard_id === cardId);
  }, [progress]);

  const isComplete = currentIndex >= flashcards.length;

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    studiedToday,
    masteredCount,
    totalCards: flashcards.length,
    isComplete,
    currentCard: flashcards[currentIndex],
    handleCardChoice,
    handleNext,
    handlePrevious,
    handleFlip,
    getCardProgress,
    setIsFlipped
  };
};
