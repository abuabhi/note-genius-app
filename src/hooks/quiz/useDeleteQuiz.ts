
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      // First, get all question IDs for this quiz
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quizId);

      if (questionsError) throw questionsError;

      const questionIds = questions?.map(q => q.id) || [];

      // Delete quiz options first (if there are questions)
      if (questionIds.length > 0) {
        const { error: optionsError } = await supabase
          .from('quiz_options')
          .delete()
          .in('question_id', questionIds);

        if (optionsError) throw optionsError;
      }

      // Delete quiz questions
      const { error: questionsDeleteError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);

      if (questionsDeleteError) throw questionsDeleteError;

      // Delete quiz results
      const { error: resultsError } = await supabase
        .from('quiz_results')
        .delete()
        .eq('quiz_id', quizId);

      if (resultsError) throw resultsError;

      // Finally delete the quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (quizError) throw quizError;

      return quizId;
    },
    onSuccess: () => {
      // Invalidate quiz-related queries
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
  });
};
