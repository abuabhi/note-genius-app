
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QuizResultItem {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  duration_seconds: number | null;
  completed_at: string;
  quiz: {
    title: string;
    description: string | null;
  };
}

interface QuizSessionItem {
  id: string;
  flashcard_set_id: string;
  start_time: string;
  end_time: string;
  total_cards: number;
  correct_answers: number;
  total_score: number;
  duration_seconds: number;
  average_response_time: number;
  grade: string;
  flashcard_set: {
    name: string;
    subject: string;
  };
}

export const useQuizHistoryData = (userId?: string) => {
  // Fetch traditional quiz results
  const { data: quizResults, isLoading: isLoadingQuizResults, error: quizResultsError } = useQuery({
    queryKey: ['quiz-results', userId],
    queryFn: async () => {
      console.log('Fetching quiz results for user:', userId);
      
      const { data: currentUser } = await supabase.auth.getUser();
      const authenticatedUserId = currentUser?.user?.id;
      
      if (!authenticatedUserId) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('quiz_results')
        .select(`
          id,
          quiz_id,
          score,
          total_questions,
          duration_seconds,
          completed_at,
          quiz:quizzes(
            title,
            description
          )
        `)
        .eq('user_id', authenticatedUserId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz results:', error);
        throw error;
      }
      
      console.log('Quiz results fetched:', data?.length || 0);
      return data as QuizResultItem[];
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: 1000
  });

  // Fetch flashcard quiz sessions
  const { data: quizSessions, isLoading: isLoadingSessions, error: quizSessionsError } = useQuery({
    queryKey: ['quiz-sessions', userId],
    queryFn: async () => {
      console.log('Fetching quiz sessions for user:', userId);
      
      const { data: currentUser } = await supabase.auth.getUser();
      const authenticatedUserId = currentUser?.user?.id;
      
      if (!authenticatedUserId) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select(`
          id,
          flashcard_set_id,
          start_time,
          end_time,
          total_cards,
          correct_answers,
          total_score,
          duration_seconds,
          average_response_time,
          grade,
          mode
        `)
        .eq('user_id', authenticatedUserId)
        .not('end_time', 'is', null)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching quiz sessions:', error);
        throw error;
      }
      
      console.log('Quiz sessions fetched:', data?.length || 0);
      
      // Fetch flashcard set details separately
      const enhancedData = await Promise.all(data.map(async (session) => {
        const { data: setData, error: setError } = await supabase
          .from('flashcard_sets')
          .select('name, subject')
          .eq('id', session.flashcard_set_id)
          .single();
          
        if (setError) {
          console.warn('Could not fetch flashcard set details for session:', session.id, setError);
          return {
            ...session,
            flashcard_set: {
              name: 'Unknown Set',
              subject: 'Unknown Subject'
            }
          };
        }
        
        return {
          ...session,
          flashcard_set: setData
        };
      }));
      
      return enhancedData as QuizSessionItem[];
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: 1000
  });

  const isLoading = isLoadingQuizResults || isLoadingSessions;
  const hasError = quizResultsError || quizSessionsError;

  return {
    quizResults,
    quizSessions,
    isLoading,
    hasError,
    quizResultsError,
    quizSessionsError
  };
};
