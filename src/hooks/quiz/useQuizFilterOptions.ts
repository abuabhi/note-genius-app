
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuizFilterOptions = () => {
  return useQuery({
    queryKey: ['quiz-filter-options'],
    queryFn: async () => {
      console.log('🚀 Fetching quiz filter options...');

      // Fetch only subjects
      const { data: subjects, error: subjectsError } = await supabase
        .from('academic_subjects')
        .select('id, name')
        .order('name');

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError);
        throw subjectsError;
      }

      console.log('✅ Filter options fetched successfully');

      return {
        subjects: subjects || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
