
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuizWithQuestions } from '@/types/quiz';

export const useQuizList = (filters?: {
  subject?: string;
  grade?: string;
  section?: string;
  search?: string;
  userOnly?: boolean;
}) => {
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

  return {
    quizzes,
    isLoading,
    error
  };
};
