
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
      const transformedData = data?.map(plan => {
        // Safely extract topic from topics array or use empty string
        let topicName = '';
        if (plan.topics && Array.isArray(plan.topics)) {
          const firstTopic = plan.topics[0];
          if (firstTopic && typeof firstTopic === 'object' && 'name' in firstTopic) {
            topicName = String(firstTopic.name) || '';
          }
        }

        return {
          ...plan,
          total_duration_hours: plan.total_hours_per_week || 0,
          preferred_times: (plan.available_times as Record<string, any>) || {},
          study_days: Array.isArray(plan.available_days) ? plan.available_days as string[] : [],
          topic: topicName,
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
          difficulty_level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
          status: (plan.status as 'active' | 'completed' | 'paused' | 'archived') || 'active',
          is_converted_to_goals: plan.is_converted_to_goals || false
        } as StudyPlan;
      }) || [];

      // Sort plans: overdue first, then by end date
      const now = new Date();
      const sortedData = transformedData.sort((a, b) => {
        const aEndDate = new Date(a.end_date);
        const bEndDate = new Date(b.end_date);
        const aIsOverdue = aEndDate < now;
        const bIsOverdue = bEndDate < now;
        
        // Overdue plans first
        if (aIsOverdue && !bIsOverdue) return -1;
        if (!aIsOverdue && bIsOverdue) return 1;
        
        // Then sort by end date (closest first)
        return aEndDate.getTime() - bEndDate.getTime();
      });

      return sortedData;
    }
  });

  return {
    studyPlans: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
};
