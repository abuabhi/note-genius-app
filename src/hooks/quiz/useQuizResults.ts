
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuizResults = (userId?: string) => {
  const fetchResults = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const currentUser = userData.user?.id;
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw userError;
    }
    
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
