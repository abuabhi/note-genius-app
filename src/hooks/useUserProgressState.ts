import { useMemo } from 'react';
import { useLearningToolkit } from '@/hooks/useLearningToolkit';

export interface UserProgressState {
  userType: 'new' | 'intermediate' | 'advanced';
  totalItems: number;
  hasNotes: boolean;
  hasFlashcards: boolean;
  hasQuizzes: boolean;
  hasGoals: boolean;
  hasTodos: boolean;
  isLoading: boolean;
}

export const useUserProgressState = (): UserProgressState => {
  const { 
    totalNotes, 
    totalFlashcardSets, 
    totalQuizzes, 
    totalGoals, 
    totalTodos,
    isLoading 
  } = useLearningToolkit();

  const progressState = useMemo(() => {
    const totalItems = totalNotes + totalFlashcardSets + totalQuizzes + totalGoals + totalTodos;
    
    const hasNotes = totalNotes > 0;
    const hasFlashcards = totalFlashcardSets > 0;
    const hasQuizzes = totalQuizzes > 0;
    const hasGoals = totalGoals > 0;
    const hasTodos = totalTodos > 0;

    // Determine user type based on content
    let userType: 'new' | 'intermediate' | 'advanced';
    
    if (totalItems === 0) {
      userType = 'new';
    } else if (
      (totalNotes > 0 && totalNotes < 10) || 
      (totalFlashcardSets > 0 && totalFlashcardSets < 5) ||
      (totalQuizzes > 0 && totalQuizzes < 5) ||
      totalItems < 15
    ) {
      userType = 'intermediate';
    } else {
      userType = 'advanced';
    }

    console.log('🔍 [UserProgressState] Progress calculation:', { 
      totalNotes, 
      totalFlashcardSets, 
      totalQuizzes, 
      totalGoals, 
      totalTodos, 
      totalItems, 
      userType, 
      isLoading 
    });

    return {
      userType,
      totalItems,
      hasNotes,
      hasFlashcards,
      hasQuizzes,
      hasGoals,
      hasTodos,
      isLoading
    };
  }, [totalNotes, totalFlashcardSets, totalQuizzes, totalGoals, totalTodos, isLoading]);

  return progressState;
};