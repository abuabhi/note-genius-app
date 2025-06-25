
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuizFilterOptions = () => {
  return useQuery({
    queryKey: ['quiz-filter-options'],
    queryFn: async () => {
      console.log('🚀 Fetching quiz filter options...');

      // Fetch subjects, grades, and sections in parallel
      const [subjectsResponse, gradesResponse, sectionsResponse] = await Promise.all([
        supabase
          .from('academic_subjects')
          .select('id, name')
          .order('name'),
        supabase
          .from('grades')
          .select('id, name')
          .order('level'),
        supabase
          .from('sections')
          .select('id, name')
          .order('name')
      ]);

      if (subjectsResponse.error) {
        console.error('Error fetching subjects:', subjectsResponse.error);
        throw subjectsResponse.error;
      }

      if (gradesResponse.error) {
        console.error('Error fetching grades:', gradesResponse.error);
        throw gradesResponse.error;
      }

      if (sectionsResponse.error) {
        console.error('Error fetching sections:', sectionsResponse.error);
        throw sectionsResponse.error;
      }

      console.log('✅ Filter options fetched successfully');

      return {
        subjects: subjectsResponse.data || [],
        grades: gradesResponse.data || [],
        sections: sectionsResponse.data || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
