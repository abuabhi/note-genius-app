

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { StudyMode } from '@/pages/study/types';

type CardChoice = 'easy' | 'medium' | 'hard' | 'mastered' | 'needs_practice';

interface OptimizedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const useOptimizedFlashcardStudy = ({ setId, mode }: OptimizedFlashcardStudyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  // Per-session map: cardId -> latest rating. Single source of truth for counters.
  const [cardRatings, setCardRatings] = useState<Record<string, CardChoice>>({});
  
  // Manual data fetching states
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Simple activity recording functions (silent for production)
  const recordActivity = useCallback(() => {
    // Activity recorded silently
  }, []);

  const updateSessionActivity = useCallback((_activityData?: any) => {
    // Session activity updated silently
  }, []);
  
  // Manual data fetching with useEffect
  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!setId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Query flashcards through the junction table relationship
        const result: any = await (supabase as any)
          .from('flashcard_set_cards')
          .select(`
            flashcards (
              id,
              front_content,
              back_content,
              difficulty,
              last_reviewed_at,
              created_at
            )
          `)
          .eq('set_id', setId)
          .order('position');

        if (result.error) {
          throw result.error;
        }

        // Transform data - extract flashcards from junction table results
        const transformedCards = (result.data || []).map((item: any) => {
          const card = item.flashcards;
          return {
            id: card.id,
            front_content: card.front_content || '',
            back_content: card.back_content || '',
            front: card.front_content || '',
            back: card.back_content || '',
            difficulty: card.difficulty || 1,
            last_reviewed: card.last_reviewed_at
          };
        });

        setFlashcards(transformedCards);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [setId]);

  // Initialize session activity tracking
  useEffect(() => {
    if (flashcards.length > 0) {
      updateSessionActivity({ flashcardSetId: setId, mode });
    }
  }, [flashcards.length, setId, mode, updateSessionActivity]);

  const currentCard = flashcards[currentIndex] || null;
  const totalCards = flashcards.length;
  const isComplete = currentIndex >= totalCards && totalCards > 0;

  const handleNext = useCallback(() => {
    recordActivity();
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalCards, recordActivity]);

  const handlePrevious = useCallback(() => {
    recordActivity();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex, recordActivity]);

  const handleFlip = useCallback(() => {
    recordActivity();
    setIsFlipped(prev => !prev);
  }, [recordActivity]);

  const handleCardChoice = useCallback(async (choice: CardChoice) => {
    if (!currentCard) return;

    recordActivity();

    const previousChoice = cardRatings[currentCard.id];
    const isReRating = previousChoice !== undefined;

    try {
      // Update flashcard difficulty based on choice
      let newDifficulty = currentCard.difficulty;

      switch (choice) {
        case 'easy':
          newDifficulty = Math.max(1, currentCard.difficulty - 1);
          break;
        case 'medium':
          break;
        case 'hard':
          newDifficulty = Math.min(5, currentCard.difficulty + 1);
          break;
        case 'mastered':
          newDifficulty = 1;
          break;
        case 'needs_practice':
          newDifficulty = Math.min(5, currentCard.difficulty + 2);
          break;
      }

      // Persist the latest rating for this card (always — user's most recent intent)
      const updateResult: any = await (supabase as any)
        .from('flashcards')
        .update({
          difficulty: newDifficulty,
          last_reviewed_at: new Date().toISOString()
        })
        .eq('id', currentCard.id);

      if (updateResult.error) throw updateResult.error;

      // Update the per-session rating map (single source of truth for counters)
      setCardRatings(prev => ({ ...prev, [currentCard.id]: choice }));

      if (isReRating) {
        // User is correcting a previous rating — don't double-count, don't auto-advance
        if (previousChoice !== choice) {
          const label = choice.replace('_', ' ');
          toast.success(`Updated to ${label.charAt(0).toUpperCase() + label.slice(1)}`);
        }
      } else {
        // First rating for this card — advance to next
        setTimeout(() => {
          handleNext();
        }, 500);
      }
    } catch {
      // Silent fail for card update
    }
  }, [currentCard, cardRatings, recordActivity, handleNext]);

  // Derive counters from the rating map. Clamp to totalCards as a safety net.
  const counters = useMemo(() => {
    const ratings = Object.values(cardRatings);
    const clamp = (n: number) => Math.min(n, totalCards);
    return {
      studiedToday: clamp(ratings.length),
      masteredCount: clamp(ratings.filter(r => r === 'mastered').length),
      needsPracticeCount: clamp(ratings.filter(r => r === 'needs_practice').length),
      easyCount: clamp(ratings.filter(r => r === 'easy').length),
      mediumCount: clamp(ratings.filter(r => r === 'medium').length),
      hardCount: clamp(ratings.filter(r => r === 'hard').length),
    };
  }, [cardRatings, totalCards]);

  const { studiedToday, masteredCount } = counters;

  // Calculate progress stats
  const progressStats = {
    currentIndex: Math.min(currentIndex + 1, totalCards),
    totalCards,
    studiedToday,
    masteredCount,
    completionPercentage: totalCards > 0 ? Math.round((currentIndex / totalCards) * 100) : 0
  };

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    isComplete,
    currentCard,
    totalCards,
    studiedToday,
    masteredCount,
    cardRatings,
    progressStats,
    handleNext,
    handlePrevious,
    handleFlip,
    handleCardChoice,
    setIsFlipped
  };
};


