
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudyPlanFormValues } from '@/types/studyPlanner';

export const useCreateStudyPlan = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: StudyPlanFormValues): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert form data to database format
      const studyPlanData = {
        title: formData.title,
        description: formData.description || null,
        subject: formData.subject,
        total_hours_per_week: formData.totalHours,
        start_date: formData.startDate,
        end_date: formData.endDate,
        available_times: {},
        available_days: formData.studyDays,
        topics: [{ name: formData.topic, duration_hours: 0, difficulty: 'intermediate' }],
        preferred_session_duration: formData.sessionDuration,
        study_style: formData.learningStyle,
        status: 'active'
      };

      const { error } = await supabase
        .from('study_plans')
        .insert({
          user_id: user.id,
          ...studyPlanData
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['study-planner-stats'] });
    }
  });

  return {
    createStudyPlan: mutation.mutateAsync,
    isLoading: mutation.isPending
  };
};
