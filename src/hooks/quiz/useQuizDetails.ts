
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuizWithQuestions } from '@/types/quiz';

export const useQuizDetails = (quizId: string | undefined) => {
  const fetchQuiz = async () => {
    if (!quizId) return null;
    
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions(
          *,
          options:quiz_options(*)
        )
      `)
      .eq('id', quizId)
      .single();
    
    if (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
    
    return data as unknown as QuizWithQuestions;
  };
  
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: fetchQuiz,
    enabled: !!quizId
  });
};
