
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudyPlanFormValues, CreateStudyPlanData } from '@/types/studyPlanner';

export const useCreateStudyPlan = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: StudyPlanFormValues): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert form data to database format
      const studyPlanData: CreateStudyPlanData = {
        title: formData.title,
        description: formData.description || null,
        subject: formData.subject,
        total_duration_hours: formData.totalHours,
        start_date: formData.startDate,
        end_date: formData.endDate,
        preferred_times: {},
        study_days: formData.studyDays,
        topics: formData.topics.map(topic => ({ name: topic, duration_hours: 0, difficulty: formData.difficultyLevel })),
        difficulty_level: formData.difficultyLevel,
        learning_objectives: [],
        session_duration_minutes: formData.sessionDuration,
        break_duration_minutes: formData.breakDuration,
        max_sessions_per_day: formData.maxSessionsPerDay,
        learning_style: formData.learningStyle,
        related_flashcard_sets: [],
        related_notes: []
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
