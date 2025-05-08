
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newQuiz: {
      title: string;
      description?: string;
      category_id?: string;
      section_id?: string;
      grade_id?: string;
      source_type: 'prebuilt' | 'note' | 'custom';
      source_id?: string;
      is_public?: boolean;
      questions: {
        question: string;
        question_type?: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';
        explanation?: string;
        difficulty?: number;
        position?: number;
        options: {
          content: string;
          is_correct: boolean;
          position?: number;
        }[];
      }[];
    }) => {
      // First insert the quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: newQuiz.title,
          description: newQuiz.description || null,
          category_id: newQuiz.category_id || null,
          section_id: newQuiz.section_id || null,
          grade_id: newQuiz.grade_id || null,
          source_type: newQuiz.source_type,
          source_id: newQuiz.source_id || null,
          is_public: newQuiz.is_public || false,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (quizError) {
        console.error('Error creating quiz:', quizError);
        throw quizError;
      }
      
      // Then insert questions and options
      for (const [qIndex, questionData] of newQuiz.questions.entries()) {
        const { data: question, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quiz.id,
            question: questionData.question,
            question_type: questionData.question_type || 'multiple_choice',
            explanation: questionData.explanation || null,
            difficulty: questionData.difficulty || 1,
            position: questionData.position !== undefined ? questionData.position : qIndex
          })
          .select()
          .single();
        
        if (questionError) {
          console.error('Error creating question:', questionError);
          throw questionError;
        }
        
        // Insert options for this question
        const optionsToInsert = questionData.options.map((opt, index) => ({
          question_id: question.id,
          content: opt.content,
          is_correct: opt.is_correct,
          position: opt.position !== undefined ? opt.position : index
        }));
        
        const { error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsToInsert);
        
        if (optionsError) {
          console.error('Error creating options:', optionsError);
          throw optionsError;
        }
      }
      
      return quiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Quiz created",
        description: "Your quiz has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create quiz",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
