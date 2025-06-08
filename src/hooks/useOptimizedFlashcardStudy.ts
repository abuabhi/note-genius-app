
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { StudyMode } from '@/pages/study/types';
import { Flashcard } from '@/types/flashcard';
import { useGlobalSessionTracker } from './useGlobalSessionTracker';

interface UseOptimizedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

interface FlashcardWithProgress extends Flashcard {
  mastery_level?: string;
  review_count?: number;
  last_reviewed_at?: string;
  next_review_date?: string;
}

export const useOptimizedFlashcardStudy = ({ setId, mode }: UseOptimizedFlashcardStudyProps) => {
  const { user } = useAuth();
  const { updateSessionActivity, recordActivity } = useGlobalSessionTracker();
  
  const [flashcards, setFlashcards] = useState<FlashcardWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studiedToday, setStudiedToday] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);

  // Load flashcards and progress
  useEffect(() => {
    const loadFlashcards = async () => {
      if (!user || !setId) return;

      try {
        setIsLoading(true);
        setError(null);

        // First, get flashcards that belong to this set
        const { data: setCards, error: setCardsError } = await supabase
          .from('flashcard_set_cards')
          .select('flashcard_id')
          .eq('set_id', setId);

        if (setCardsError) throw setCardsError;

        const flashcardIds = setCards.map(card => card.flashcard_id);

        if (flashcardIds.length === 0) {
          setFlashcards([]);
          setIsLoading(false);
          return;
        }

        // Fetch flashcards with progress
        const { data: flashcardsData, error: flashcardsError } = await supabase
          .from('flashcards')
          .select(`
            *,
            user_flashcard_progress!left (
              mastery_level,
              last_reviewed_at
            )
          `)
          .in('id', flashcardIds)
          .order('created_at');

        if (flashcardsError) throw flashcardsError;

        const processedFlashcards = flashcardsData.map(card => ({
          ...card,
          mastery_level: card.user_flashcard_progress?.[0]?.mastery_level || 'new',
          review_count: 0,
          last_reviewed_at: card.user_flashcard_progress?.[0]?.last_reviewed_at,
          next_review_date: null
        }));

        // Filter cards based on study mode
        let filteredCards = processedFlashcards;
        if (mode === 'review') {
          filteredCards = processedFlashcards.filter(card => 
            card.mastery_level === 'needs_practice' || card.last_reviewed_at
          );
        } else if (mode === 'learn') {
          filteredCards = processedFlashcards.filter(card => 
            !card.last_reviewed_at
          );
        }

        setFlashcards(filteredCards);
        
        // Count cards studied today and mastered
        const today = new Date().toDateString();
        const todayCount = filteredCards.filter(card => 
          card.last_reviewed_at && new Date(card.last_reviewed_at).toDateString() === today
        ).length;
        
        const masteredCards = filteredCards.filter(card => 
          card.mastery_level === 'mastered'
        ).length;
        
        setStudiedToday(todayCount);
        setMasteredCount(masteredCards);

      } catch (err) {
        console.error('Error loading flashcards:', err);
        setError(err instanceof Error ? err.message : 'Failed to load flashcards');
        toast.error('Failed to load flashcards');
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, [user, setId, mode]);

  const handleCardChoice = useCallback(async (choice: 'mastered' | 'needs_practice') => {
    if (!user || !flashcards[currentIndex]) return;

    const currentCard = flashcards[currentIndex];
    recordActivity(); // Record user activity

    try {
      const now = new Date().toISOString();

      // Update progress in database using correct schema
      const { error } = await supabase
        .from('user_flashcard_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: currentCard.id,
          mastery_level: choice === 'mastered' ? 1 : 0, // mastery_level is integer
          last_reviewed_at: now,
          last_score: choice === 'mastered' ? 5 : 1
        });

      if (error) throw error;

      // Update local state
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[currentIndex] = {
        ...currentCard,
        mastery_level: choice,
        last_reviewed_at: now
      };
      setFlashcards(updatedFlashcards);

      // Update session activity with cards reviewed
      await updateSessionActivity({
        cards_reviewed: 1,
        cards_correct: choice === 'mastered' ? 1 : 0
      });

      // Update today's count
      setStudiedToday(prev => prev + 1);
      
      if (choice === 'mastered') {
        setMasteredCount(prev => prev + 1);
      }

      // Move to next card
      handleNext();

    } catch (error) {
      console.error('Error updating card progress:', error);
      toast.error('Failed to update card progress');
    }
  }, [user, flashcards, currentIndex, updateSessionActivity, recordActivity]);

  const handleNext = useCallback(() => {
    recordActivity(); // Record user activity
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % flashcards.length);
  }, [flashcards.length, recordActivity]);

  const handlePrevious = useCallback(() => {
    recordActivity(); // Record user activity
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
  }, [flashcards.length, recordActivity]);

  const handleFlip = useCallback(() => {
    recordActivity(); // Record user activity
    setIsFlipped(prev => !prev);
  }, [recordActivity]);

  // Memoized values
  const currentCard = useMemo(() => flashcards[currentIndex] || null, [flashcards, currentIndex]);
  const isComplete = useMemo(() => flashcards.length === 0, [flashcards.length]);
  const totalCards = flashcards.length;

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
    handleNext,
    handlePrevious,
    handleFlip,
    handleCardChoice,
    setIsFlipped
  };
};
