
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudyPlan } from '@/types/studyPlanner';

export const useActiveStudyPlans = () => {
  const query = useQuery({
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
      
      // Transform the data to match our StudyPlan interface
      const transformedData = data?.map(plan => ({
        ...plan,
        total_duration_hours: plan.total_hours_per_week || 0,
        preferred_times: (plan.available_times as Record<string, any>) || {},
        study_days: Array.isArray(plan.available_days) ? plan.available_days as string[] : [],
        topic: Array.isArray(plan.topics) && plan.topics.length > 0 ? plan.topics[0]?.name || '' : '',
        daily_duration_minutes: Math.round((plan.total_hours_per_week || 0) * 60 / 7),
        session_duration_minutes: plan.preferred_session_duration || 45,
        break_duration_minutes: 10,
        max_sessions_per_day: 3,
        completion_percentage: 0,
        current_topic_index: 0,
        sessions_completed: 0,
        can_convert_to_goals: true,
        related_flashcard_sets: [],
        related_notes: [],
        learning_style: (plan.study_style as 'visual' | 'auditory' | 'kinesthetic' | 'mixed') || 'mixed',
        learning_objectives: [],
        status: (plan.status as 'active' | 'completed' | 'paused' | 'archived') || 'active',
        is_converted_to_goals: plan.is_converted_to_goals || false
      })) || [];

      return transformedData;
    }
  });

  return {
    studyPlans: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
};
