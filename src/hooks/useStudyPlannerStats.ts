
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StudyPlannerStats {
  activePlansCount: number;
  totalHoursPlanned: number;
  completionRate: number;
  currentStreak: number;
}

export const useStudyPlannerStats = () => {
  const query = useQuery({
    queryKey: ['study-planner-stats'],
    queryFn: async (): Promise<StudyPlannerStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get active plans count
      const { data: activePlans } = await supabase
        .from('study_plans')
        .select('id, total_duration_hours, completion_percentage')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Get completed plans for completion rate
      const { data: completedPlans } = await supabase
        .from('study_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Calculate stats
      const activePlansCount = activePlans?.length || 0;
      const totalHoursPlanned = activePlans?.reduce((sum, plan) => sum + (plan.total_duration_hours || 0), 0) || 0;
      const totalPlans = activePlansCount + (completedPlans?.length || 0);
      const completionRate = totalPlans > 0 ? Math.round(((completedPlans?.length || 0) / totalPlans) * 100) : 0;

      // Calculate average completion rate of active plans
      const avgCompletionRate = activePlans && activePlans.length > 0 
        ? Math.round(activePlans.reduce((sum, plan) => sum + (plan.completion_percentage || 0), 0) / activePlans.length)
        : 0;

      return {
        activePlansCount,
        totalHoursPlanned,
        completionRate: Math.max(completionRate, avgCompletionRate),
        currentStreak: 0 // This would need session data to calculate properly
      };
    }
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    error: query.error
  };
};
