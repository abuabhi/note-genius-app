
import { useQuizList } from './quiz/useQuizList';
import { useQuizDetails } from './quiz/useQuizDetails';
import { useCreateQuiz } from './quiz/useCreateQuiz';
import { useQuizResults } from './quiz/useQuizResults';
import { useSubmitQuizResult } from './quiz/useSubmitQuizResult';

// Re-export all quiz hooks for backward compatibility
export const useQuizzes = (filters?: {
  subject?: string;
  grade?: string;
  section?: string;
  search?: string;
  userOnly?: boolean;
}) => {
  const { quizzes, isLoading, error } = useQuizList(filters);
  const { mutateAsync: createQuiz, isPending } = useCreateQuiz();
  
  return {
    quizzes,
    isLoading,
    error,
    createQuiz: {
      mutateAsync: createQuiz,
      isPending
    }
  };
};

export const useQuiz = useQuizDetails;
export { useQuizResults, useSubmitQuizResult };
