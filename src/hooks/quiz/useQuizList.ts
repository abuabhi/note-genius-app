
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
      let query = supabase
        .from('quizzes')
        .select(`
          *,
          academic_subjects(name),
          grades(name),
          sections(name)
        `);

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

      if (filters.userOnly) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
      }

      return data || [];
    },
  });
};
