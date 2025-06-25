import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuizList = (filters: {
  subject?: string;
  grade?: string;
  section?: string;
  search?: string;
  userOnly?: boolean;
} = {}) => {
  return useQuery({
    queryKey: ['quizzes', filters],
    queryFn: async () => {
      console.log('🚀 Fetching quizzes with filters:', filters);

      // Start with a simplified query - fetch basic quiz data first
      let query = supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          is_public,
          created_at,
          updated_at,
          user_id,
          subject_id,
          grade_id,
          section_id
        `);

      // Apply basic filters
      if (filters.subject) {
        query = query.eq('subject_id', filters.subject);
      }

      if (filters.grade) {
        query = query.eq('grade_id', filters.grade);
      }

      if (filters.section) {
        query = query.eq('section_id', filters.section);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Get current user for filtering
      const { data: { user } } = await supabase.auth.getUser();
      
      if (filters.userOnly && user) {
        query = query.eq('user_id', user.id);
      } else {
        // Show public quizzes and user's own quizzes
        if (user) {
          query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
        } else {
          query = query.eq('is_public', true);
        }
      }

      const { data: quizzes, error } = await query
        .order('created_at', { ascending: false })
        .limit(50); // Limit to improve performance

      if (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
      }

      console.log(`✅ Fetched ${quizzes?.length || 0} quizzes`);

      // Get question counts in a separate query for better performance
      if (quizzes && quizzes.length > 0) {
        const quizIds = quizzes.map(q => q.id);
        const { data: questionCounts } = await supabase
          .from('quiz_questions')
          .select('quiz_id')
          .in('quiz_id', quizIds);

        // Count questions per quiz
        const countMap = questionCounts?.reduce((acc, q) => {
          acc[q.quiz_id] = (acc[q.quiz_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        // Get academic subjects for the quizzes that have them
        const subjectIds = quizzes.map(q => q.subject_id).filter(Boolean);
        let subjectsMap = {};
        
        if (subjectIds.length > 0) {
          const { data: subjects } = await supabase
            .from('academic_subjects')
            .select('id, name')
            .in('id', subjectIds);
          
          subjectsMap = subjects?.reduce((acc, s) => {
            acc[s.id] = s;
            return acc;
          }, {} as Record<string, any>) || {};
        }

        // Transform the data to include question count and subject info
        const enrichedQuizzes = quizzes.map(quiz => ({
          ...quiz,
          questionCount: countMap[quiz.id] || 0,
          academic_subjects: quiz.subject_id ? subjectsMap[quiz.subject_id] : null,
          // Keep the old structure for compatibility
          quiz_questions: Array(countMap[quiz.id] || 0).fill({}),
        }));

        return { quizzes: enrichedQuizzes };
      }

      return { quizzes: quizzes || [] };
    },
    staleTime: 30 * 1000, // 30 seconds - reduced from default for better UX
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Reduced retries for faster failure feedback
    retryDelay: 1000, // Faster retry
  });
};
