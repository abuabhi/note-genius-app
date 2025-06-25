
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuizFilterOptions = () => {
  return useQuery({
    queryKey: ['quiz-filter-options'],
    queryFn: async () => {
      console.log('🚀 Fetching quiz filter options...');

      // Fetch subjects and grades in parallel (removed sections)
      const [subjectsResponse, gradesResponse] = await Promise.all([
        supabase
          .from('academic_subjects')
          .select('id, name')
          .order('name'),
        supabase
          .from('grades')
          .select('id, name')
          .order('level')
      ]);

      if (subjectsResponse.error) {
        console.error('Error fetching subjects:', subjectsResponse.error);
        throw subjectsResponse.error;
      }

      if (gradesResponse.error) {
        console.error('Error fetching grades:', gradesResponse.error);
        throw gradesResponse.error;
      }

      console.log('✅ Filter options fetched successfully');

      return {
        subjects: subjectsResponse.data || [],
        grades: gradesResponse.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
