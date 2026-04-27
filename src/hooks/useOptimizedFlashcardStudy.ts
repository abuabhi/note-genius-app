

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

  const handleCardChoice = useCallback(async (choice: 'easy' | 'medium' | 'hard' | 'mastered' | 'needs_practice') => {
    if (!currentCard) return;
    
    recordActivity();
    
    try {
      // Update flashcard difficulty based on choice
      let newDifficulty = currentCard.difficulty;
      let incrementStudied = false;
      let incrementMastered = false;

      switch (choice) {
        case 'easy':
          newDifficulty = Math.max(1, currentCard.difficulty - 1);
          incrementStudied = true;
          break;
        case 'medium':
          incrementStudied = true;
          break;
        case 'hard':
          newDifficulty = Math.min(5, currentCard.difficulty + 1);
          incrementStudied = true;
          break;
        case 'mastered':
          newDifficulty = 1;
          incrementStudied = true;
          incrementMastered = true;
          break;
        case 'needs_practice':
          newDifficulty = Math.min(5, currentCard.difficulty + 2);
          incrementStudied = true;
          break;
      }

      // Update the flashcard in the database - use explicit any typing
      const updateResult: any = await (supabase as any)
        .from('flashcards')
        .update({ 
          difficulty: newDifficulty,
          last_reviewed_at: new Date().toISOString()
        })
        .eq('id', currentCard.id);

      if (updateResult.error) throw updateResult.error;

      // Update local state
      if (incrementStudied) {
        setStudiedToday(prev => prev + 1);
      }
      if (incrementMastered) {
        setMasteredCount(prev => prev + 1);
      }

      // Move to next card
      setTimeout(() => {
        handleNext();
      }, 500);

    } catch {
      // Silent fail for card update
    }
  }, [currentCard, recordActivity, handleNext]);

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
    progressStats,
    handleNext,
    handlePrevious,
    handleFlip,
    handleCardChoice,
    setIsFlipped
  };
};

