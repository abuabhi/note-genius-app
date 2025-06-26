
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudyPlan } from '@/types/studyPlanner';

export const useActiveStudyPlans = () => {
  return useQuery({
    queryKey: ['active-study-plans'],
    queryFn: async (): Promise<StudyPlan[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });
};
