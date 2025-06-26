import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudyMode } from '@/pages/study/types';

// Simplified flashcard type - no duplicate properties
interface SimpleFlashcard {
  id: string;
  front_content: string;
  back_content: string;
  difficulty: number;
  set_id?: string;
  last_reviewed?: string;
}

interface OptimizedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

// Simple data fetcher function
const fetchFlashcards = async (setId: string): Promise<SimpleFlashcard[]> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('set_id', setId)
    .order('created_at');

  if (error) throw error;
  
  return (data || []).map((item: any) => ({
    id: item.id,
    front_content: item.front_content || '',
    back_content: item.back_content || '',
    difficulty: item.difficulty || 1,
    set_id: item.set_id,
    last_reviewed: item.last_reviewed_at
  }));
};

export const useOptimizedFlashcardStudy = ({ setId, mode }: OptimizedFlashcardStudyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedToday, setStudiedToday] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  
  // Simple activity recording functions
  const recordActivity = useCallback(() => {
    console.log('📊 Activity recorded for flashcard study');
  }, []);

  const updateSessionActivity = useCallback((activityData?: any) => {
    console.log('📊 Session activity updated:', activityData);
  }, []);
  
  // Use explicit typing to avoid inference issues
  const {
    data: flashcards = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['flashcards', setId],
    queryFn: () => fetchFlashcards(setId),
    enabled: !!setId
  });

  // Initialize session activity tracking
  useEffect(() => {
    if (flashcards.length > 0) {
      updateSessionActivity({ flashcardSetId: setId, mode });
    }
  }, [flashcards.length, setId, mode, updateSessionActivity]);

  const currentCard = flashcards[currentIndex];
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
          // Keep same difficulty
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

      // Update the flashcard in the database
      const { error } = await supabase
        .from('flashcards')
        .update({ 
          difficulty: newDifficulty,
          last_reviewed_at: new Date().toISOString()
        })
        .eq('id', currentCard.id);

      if (error) throw error;

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

    } catch (error) {
      console.error('Error updating flashcard:', error);
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

  // Add compatibility properties for components that expect 'front' and 'back'
  const currentCardWithCompatibility = currentCard ? {
    ...currentCard,
    front: currentCard.front_content,
    back: currentCard.back_content
  } : null;

  return {
    flashcards: flashcards.map(card => ({
      ...card,
      front: card.front_content,
      back: card.back_content
    })),
    currentIndex,
    isFlipped,
    isLoading,
    error: error as Error | null,
    isComplete,
    currentCard: currentCardWithCompatibility,
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
