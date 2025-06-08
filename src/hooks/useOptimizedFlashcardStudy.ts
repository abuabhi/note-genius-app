
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { StudyMode } from '@/pages/study/types';
import { FlashcardWithProgress } from '@/types/flashcard';
import { useGlobalSessionTracker } from './useGlobalSessionTracker';

interface UseOptimizedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
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

        // Fetch flashcards with progress
        const { data: flashcardsData, error: flashcardsError } = await supabase
          .from('flashcards')
          .select(`
            *,
            user_flashcard_progress!left (
              mastery_level,
              review_count,
              last_reviewed_at,
              next_review_date
            )
          `)
          .eq('set_id', setId)
          .order('created_at');

        if (flashcardsError) throw flashcardsError;

        const processedFlashcards = flashcardsData.map(card => ({
          ...card,
          mastery_level: card.user_flashcard_progress?.[0]?.mastery_level || 'new',
          review_count: card.user_flashcard_progress?.[0]?.review_count || 0,
          last_reviewed_at: card.user_flashcard_progress?.[0]?.last_reviewed_at,
          next_review_date: card.user_flashcard_progress?.[0]?.next_review_date
        }));

        // Filter cards based on study mode
        let filteredCards = processedFlashcards;
        if (mode === 'review') {
          filteredCards = processedFlashcards.filter(card => 
            card.mastery_level === 'needs_practice' || card.review_count > 0
          );
        } else if (mode === 'new') {
          filteredCards = processedFlashcards.filter(card => 
            card.mastery_level === 'new' && card.review_count === 0
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
      const nextReviewDate = choice === 'mastered' 
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days later
        : new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(); // 1 day later

      // Update progress in database
      const { error } = await supabase
        .from('user_flashcard_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: currentCard.id,
          mastery_level: choice,
          review_count: (currentCard.review_count || 0) + 1,
          last_reviewed_at: now,
          next_review_date: nextReviewDate
        });

      if (error) throw error;

      // Update local state
      const updatedFlashcards = [...flashcards];
      updatedFlashcards[currentIndex] = {
        ...currentCard,
        mastery_level: choice,
        review_count: (currentCard.review_count || 0) + 1,
        last_reviewed_at: now,
        next_review_date: nextReviewDate
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
