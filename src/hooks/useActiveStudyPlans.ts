
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
        topics: Array.isArray(plan.topics) ? plan.topics : [],
        difficulty_level: (plan.difficulty_level as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
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
        learning_objectives: []
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
