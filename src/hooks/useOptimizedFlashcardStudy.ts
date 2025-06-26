
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudyMode } from '@/pages/study/types';

// Define a simplified flashcard type to avoid type recursion
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

export const useOptimizedFlashcardStudy = ({ setId, mode }: OptimizedFlashcardStudyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedToday, setStudiedToday] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  
  // Simple activity recording functions without complex session tracker integration
  const recordActivity = useCallback(() => {
    console.log('📊 Activity recorded for flashcard study');
  }, []);

  const updateSessionActivity = useCallback((activityData?: any) => {
    console.log('📊 Session activity updated:', activityData);
  }, []);
  
  // Fetch flashcards for the set
  const { 
    data: flashcards = [], 
    isLoading, 
    error 
  } = useQuery<SimpleFlashcard[]>({
    queryKey: ['flashcards', setId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('flashcard_set_id', setId)
        .order('created_at');

      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        front_content: item.front_content || item.front || '',
        back_content: item.back_content || item.back || '',
        difficulty: item.difficulty || 1,
        set_id: item.set_id,
        last_reviewed: item.last_reviewed_at
      }));
    },
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
          last_reviewed: new Date().toISOString()
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

  return {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error: error as Error | null,
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
