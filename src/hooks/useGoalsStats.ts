
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export interface GoalsStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  goalsFromPlans: number;
}

export const useGoalsStats = () => {
  const { user } = useRequireAuth();

  return useQuery({
    queryKey: ['goals-stats', user?.id],
    queryFn: async (): Promise<GoalsStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get all goals for the user
      const { data: allGoals, error: allGoalsError } = await supabase
        .from('study_goals')
        .select('id, status, is_completed')
        .eq('user_id', user.id);

      if (allGoalsError) throw allGoalsError;

      // Get goals that were created from study plans
      const { data: planGoals, error: planGoalsError } = await supabase
        .from('study_goals')
        .select('id')
        .eq('user_id', user.id)
        .like('title', '%:%'); // Goals from plans have format "Subject: Topic"

      if (planGoalsError) throw planGoalsError;

      const totalGoals = allGoals?.length || 0;
      const activeGoals = allGoals?.filter(goal => 
        goal.status === 'active' && !goal.is_completed
      ).length || 0;
      const completedGoals = allGoals?.filter(goal => 
        goal.is_completed || goal.status === 'completed'
      ).length || 0;
      const goalsFromPlans = planGoals?.length || 0;

      return {
        totalGoals,
        activeGoals,
        completedGoals,
        goalsFromPlans,
      };
    },
    enabled: !!user?.id,
  });
};
