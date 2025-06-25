
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSubmitQuizResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      quizId: string;
      score: number;
      totalQuestions: number;
      duration?: number;
      responses: any[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert quiz result
      const { data: result, error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          quiz_id: data.quizId,
          user_id: user.id,
          score: data.score,
          total_questions: data.totalQuestions,
          duration_seconds: data.duration || null,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (resultError) throw resultError;

      // Insert individual question responses
      if (data.responses && data.responses.length > 0) {
        const responses = data.responses.map(response => ({
          result_id: result.id,
          question_id: response.questionId,
          selected_option_id: response.selectedOptionId || null,
          is_correct: response.isCorrect,
          time_spent_seconds: response.timeSpent || null,
        }));

        const { error: responsesError } = await supabase
          .from('quiz_question_responses')
          .insert(responses);

        if (responsesError) throw responsesError;
      }

      return result;
    },
    onSuccess: () => {
      // Invalidate quiz results queries
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
    },
  });
};
