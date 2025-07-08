
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuizList = (filters: {
  subject?: string;
  search?: string;
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
          section_id,
          source_type,
          source_id
        `);

      // Get current user for filtering - show public quizzes and user's own quizzes
      const { data: { user } } = await supabase.auth.getUser();

      // Apply basic filters - use user_subjects for filtering
      if (filters.subject && filters.subject !== 'all' && user) {
        try {
          // Get user_subjects first to find the subject_id by name
          const { data: userSubjects, error: subjectError } = await supabase
            .from('user_subjects')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', filters.subject);
          
          if (subjectError) {
            console.warn('Error fetching user subjects for quiz filtering:', subjectError);
          } else if (userSubjects && userSubjects.length > 0) {
            query = query.eq('subject_id', userSubjects[0].id);
          }
        } catch (error) {
          console.warn('Failed to apply subject filter to quizzes:', error);
        }
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (user) {
        query = query.or(`is_public.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data: quizzes, error } = await query
        .order('created_at', { ascending: false })
        .limit(50); // Limit to improve performance

      if (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
      }

      console.log(`✅ Fetched ${quizzes?.length || 0} quizzes`);

      // Get question counts and user subject data in parallel
      if (quizzes && quizzes.length > 0) {
        const quizIds = quizzes.map(q => q.id);
        const subjectIds = quizzes.map(q => q.subject_id).filter(Boolean);

        // Fetch question counts and user subjects in parallel
        const [questionCountData, userSubjectsData] = await Promise.all([
          supabase
            .from('quiz_questions')
            .select('quiz_id')
            .in('quiz_id', quizIds),
          subjectIds.length > 0 && user
            ? supabase
                .from('user_subjects')
                .select('id, name')
                .in('id', subjectIds)
                .eq('user_id', user.id)
            : Promise.resolve({ data: [] })
        ]);

        // Count questions per quiz
        const countMap = questionCountData.data?.reduce((acc, q) => {
          acc[q.quiz_id] = (acc[q.quiz_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        // Map user subjects by ID
        const userSubjectsMap: Record<string, { id: string; name: string }> = {};
        if (userSubjectsData.data) {
          userSubjectsData.data.forEach(subject => {
            if (subject && subject.id && subject.name) {
              userSubjectsMap[subject.id] = { id: subject.id, name: subject.name };
            }
          });
        }

        // Transform the data to include question count and user subject info
        const enrichedQuizzes = quizzes.map(quiz => ({
          ...quiz,
          questionCount: countMap[quiz.id] || 0,
          academic_subjects: quiz.subject_id && quiz.subject_id in userSubjectsMap ? userSubjectsMap[quiz.subject_id] : null,
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
