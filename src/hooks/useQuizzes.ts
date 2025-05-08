
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Quiz, QuizQuestion, QuizOption, QuizWithQuestions } from '@/types/quiz';
import { toast } from '@/hooks/use-toast';

export const useQuizzes = (filters?: {
  subject?: string;
  grade?: string;
  section?: string;
  search?: string;
  userOnly?: boolean;
}) => {
  const queryClient = useQueryClient();
  
  const fetchQuizzes = async () => {
    let query = supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions(
          *,
          options:quiz_options(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (filters?.subject) {
      query = query.eq('category_id', filters.subject);
    }
    
    if (filters?.grade) {
      query = query.eq('grade_id', filters.grade);
    }
    
    if (filters?.section) {
      query = query.eq('section_id', filters.section);
    }
    
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    
    if (filters?.userOnly) {
      query = query.eq('user_id', (await supabase.auth.getUser()).data.user?.id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
    
    return data as unknown as QuizWithQuestions[];
  };
  
  const { data: quizzes, isLoading, error } = useQuery({
    queryKey: ['quizzes', filters],
    queryFn: fetchQuizzes
  });
  
  const createQuiz = useMutation({
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
  
  return {
    quizzes,
    isLoading,
    error,
    createQuiz
  };
};

export const useQuiz = (quizId: string | undefined) => {
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
