
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSubmitQuizResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      quizId,
      score,
      totalQuestions,
      duration,
      responses
    }: {
      quizId: string;
      score: number;
      totalQuestions: number;
      duration?: number;
      responses: {
        questionId: string;
        selectedOptionId?: string;
        isCorrect: boolean;
        timeSpent?: number;
      }[];
    }) => {
      // Insert quiz result
      const { data: result, error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          quiz_id: quizId,
          score,
          total_questions: totalQuestions,
          duration_seconds: duration || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (resultError) {
        console.error('Error saving quiz result:', resultError);
        throw resultError;
      }
      
      // Insert question responses
      const responsesToInsert = responses.map(resp => ({
        result_id: result.id,
        question_id: resp.questionId,
        selected_option_id: resp.selectedOptionId || null,
        is_correct: resp.isCorrect,
        time_spent_seconds: resp.timeSpent || null
      }));
      
      const { error: responsesError } = await supabase
        .from('quiz_question_responses')
        .insert(responsesToInsert);
      
      if (responsesError) {
        console.error('Error saving question responses:', responsesError);
        throw responsesError;
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
      toast({
        title: "Quiz completed",
        description: "Your quiz results have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save quiz results",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
