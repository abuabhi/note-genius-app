
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
      console.log('Submitting quiz result:', {
        quizId,
        score,
        totalQuestions,
        duration,
        responsesCount: responses.length
      });

      // Get current user
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser?.user?.id) {
        console.error('Error getting current user:', userError);
        throw new Error('User not authenticated');
      }

      const userId = currentUser.user.id;
      console.log('Saving quiz result for user:', userId);

      // Insert quiz result
      const { data: result, error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          quiz_id: quizId,
          score,
          total_questions: totalQuestions,
          duration_seconds: duration || null,
          user_id: userId,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (resultError) {
        console.error('Error saving quiz result:', resultError);
        throw resultError;
      }

      console.log('Quiz result saved successfully:', result.id);
      
      // Insert question responses if we have them
      if (responses && responses.length > 0) {
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
          // Don't throw here, as the main result was saved
        } else {
          console.log('Question responses saved successfully');
        }
      }
      
      return result;
    },
    onSuccess: (data) => {
      console.log('Quiz submission successful, invalidating queries');
      // Invalidate and refetch quiz results
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
      toast({
        title: "Quiz completed",
        description: "Your quiz results have been saved.",
      });
    },
    onError: (error) => {
      console.error('Quiz submission failed:', error);
      toast({
        title: "Failed to save quiz results",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
