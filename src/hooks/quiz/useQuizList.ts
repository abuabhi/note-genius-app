

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

      // Get question counts and subject data in parallel
      if (quizzes && quizzes.length > 0) {
        const quizIds = quizzes.map(q => q.id);
        const subjectIds = quizzes.map(q => q.subject_id).filter(Boolean);

        // Fetch question counts and subjects in parallel
        const [questionCountData, subjectsData] = await Promise.all([
          supabase
            .from('quiz_questions')
            .select('quiz_id')
            .in('quiz_id', quizIds),
          subjectIds.length > 0 
            ? supabase
                .from('academic_subjects')
                .select('id, name')
                .in('id', subjectIds)
            : Promise.resolve({ data: [] })
        ]);

        // Count questions per quiz
        const countMap = questionCountData.data?.reduce((acc, q) => {
          acc[q.quiz_id] = (acc[q.quiz_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        // Map subjects by ID with proper typing
        const subjectsMap = subjectsData.data?.reduce((acc, s) => {
          if (s && s.id && s.name) {
            acc[s.id] = { id: s.id, name: s.name };
          }
          return acc;
        }, {} as Record<string, { id: string; name: string }>) || {};

        // Transform the data to include question count and subject info
        const enrichedQuizzes = quizzes.map(quiz => ({
          ...quiz,
          questionCount: countMap[quiz.id] || 0,
          academic_subjects: quiz.subject_id && quiz.subject_id in subjectsMap ? subjectsMap[quiz.subject_id] : null,
        }));

        return { quizzes: enrichedQuizzes };
      }

      // Return quizzes with default values for questionCount and academic_subjects
      const enrichedQuizzes = quizzes?.map(quiz => ({
        ...quiz,
        questionCount: 0,
        academic_subjects: null,
      })) || [];

      return { quizzes: enrichedQuizzes };
    },
    staleTime: 30 * 1000, // 30 seconds - reduced from default for better UX
    gcTime: 5 * 1000, // 5 minutes
    retry: 1, // Reduced retries for faster failure feedback
    retryDelay: 1000, // Faster retry
  });
};

