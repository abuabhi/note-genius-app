
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Flashcard } from '@/types/flashcard';
import { StudyMode } from '@/pages/study/types';

interface UseSimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const useSimplifiedFlashcardStudy = ({ setId, mode }: UseSimplifiedFlashcardStudyProps) => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studiedToday, setStudiedToday] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const fetchFlashcards = useCallback(async () => {
    if (!user || !setId) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching flashcards for setId:', setId);

      // Fetch flashcards in the set
      const { data: setCards, error: setError } = await supabase
        .from('flashcard_set_cards')
        .select(`
          flashcard_id,
          position,
          flashcards (
            id,
            front_content,
            back_content,
            created_at
          )
        `)
        .eq('set_id', setId)
        .order('position');

      if (setError) {
        console.error('Error fetching flashcard set cards:', setError);
        throw setError;
      }

      const cards = (setCards || [])
        .map(item => ({
          ...item.flashcards,
          position: item.position
        }))
        .filter(card => card.id) as Flashcard[];

      console.log('Fetched flashcards for study:', cards);
      setFlashcards(cards);

      // Fetch today's study stats
      const today = new Date().toISOString().split('T')[0];
      const { data: progressData } = await supabase
        .from('simple_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .gte('last_reviewed_at', today);

      setStudiedToday(progressData?.length || 0);
      setMasteredCount(progressData?.filter(p => p.status === 'mastered').length || 0);

    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setError('Failed to load flashcards');
    } finally {
      setIsLoading(false);
    }
  }, [user, setId]);

  const handleCardChoice = useCallback(async (choice: 'needs_practice' | 'mastered') => {
    if (!user || !flashcards[currentIndex]) return;

    const currentCard = flashcards[currentIndex];

    try {
      // Update progress
      await supabase
        .from('simple_flashcard_progress')
        .upsert({
          user_id: user.id,
          flashcard_id: currentCard.id,
          status: choice,
          last_reviewed_at: new Date().toISOString(),
          review_count: 1
        }, { 
          onConflict: 'user_id,flashcard_id' 
        });

      // Update local stats
      setStudiedToday(prev => prev + 1);
      if (choice === 'mastered') {
        setMasteredCount(prev => prev + 1);
      }

      // Move to next card or complete
      handleNext();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [user, flashcards, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex >= flashcards.length - 1) {
      setIsComplete(true);
    } else {
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

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    studiedToday,
    masteredCount,
    totalCards,
    isComplete,
    currentCard,
    handleCardChoice,
    handleNext,
    handlePrevious,
    handleFlip,
    setIsFlipped
  };
};
