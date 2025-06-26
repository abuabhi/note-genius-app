
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useQuizFilterOptions = () => {
  return useQuery({
    queryKey: ['quiz-filter-options'],
    queryFn: async () => {
      console.log('🚀 Fetching quiz filter options...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.log('No authenticated user found');
        return { subjects: [] };
      }

      // Fetch user's personal subjects (same as settings page)
      const { data: subjects, error: subjectsError } = await supabase
        .from('user_subjects')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');

      if (subjectsError) {
        console.error('Error fetching user subjects:', subjectsError);
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
