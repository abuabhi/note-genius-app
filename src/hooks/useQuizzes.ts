
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateQuizPayload {
  title: string;
  description?: string;
  subject_id?: string;
  section_id?: string;
  grade_id?: string;
  country_id?: string;
  education_system?: string;
  source_type: 'prebuilt' | 'note' | 'custom';
  source_id?: string;
  is_public?: boolean;
  questions: {
    question: string;
    explanation?: string;
    difficulty: number;
    options: {
      content: string;
      is_correct: boolean;
    }[];
  }[];
}

export const useQuizzes = () => {
  const queryClient = useQueryClient();
  
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions:quiz_questions(
            *,
            options:quiz_options(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const createQuiz = useMutation({
    mutationFn: async (payload: CreateQuizPayload) => {
      console.log('Creating quiz with payload:', payload);
      
      // Create the quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: payload.title,
          description: payload.description,
          subject_id: payload.subject_id,
          section_id: payload.section_id,
          grade_id: payload.grade_id,
          country_id: payload.country_id,
          education_system: payload.education_system,
          source_type: payload.source_type,
          source_id: payload.source_id,
          is_public: payload.is_public || false
        })
        .select()
        .single();
        
      if (quizError) {
        console.error('Error creating quiz:', quizError);
        throw quizError;
      }
      
      console.log('Created quiz:', quiz.id);
      
      // Create questions and options
      for (let i = 0; i < payload.questions.length; i++) {
        const questionData = payload.questions[i];
        
        const { data: question, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quiz.id,
            question: questionData.question,
            explanation: questionData.explanation,
            difficulty: questionData.difficulty,
            position: i
          })
          .select()
          .single();
          
        if (questionError) {
          console.error('Error creating question:', questionError);
          throw questionError;
        }
        
        // Create options for this question
        const optionsData = questionData.options.map((option, index) => ({
          question_id: question.id,
          content: option.content,
          is_correct: option.is_correct,
          position: index
        }));
        
        const { error: optionsError } = await supabase
          .from('quiz_options')
          .insert(optionsData);
          
        if (optionsError) {
          console.error('Error creating options:', optionsError);
          throw optionsError;
        }
      }
      
      return quiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: (error) => {
      console.error('Quiz creation failed:', error);
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  return {
    quizzes,
    isLoading,
    createQuiz
  };
};

export const useQuiz = (quizId?: string) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!quizId) throw new Error('Quiz ID is required');
      
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
      
      if (error) throw error;
      return data;
    },
    enabled: !!quizId
  });
};

export const useQuizResults = (userId?: string) => {
  const fetchResults = async () => {
    const currentUser = (await supabase.auth.getUser()).data.user?.id;
    
    if (!currentUser && !userId) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('quiz_results')
      .select(`
        *,
        quiz:quizzes(
          id,
          title,
          description
        )
      `)
      .eq('user_id', userId || currentUser)
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }
    
    return data;
  };
  
  return useQuery({
    queryKey: ['quiz-results', userId],
    queryFn: fetchResults
  });
};

export const useSubmitQuizResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ quizId, score, totalQuestions, duration, responses }: {
      quizId: string;
      score: number;
      totalQuestions: number;
      duration?: number;
      responses: any[];
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          quiz_id: quizId,
          user_id: user.user.id,
          score,
          total_questions: totalQuestions,
          duration_seconds: duration
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
    }
  });
};
