
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudyPlan } from '@/types/studyPlanner';
import { toast } from 'sonner';

export const useConvertStudyPlanToGoal = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (studyPlan: StudyPlan): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate total target hours from the study plan
      const startDate = new Date(studyPlan.start_date);
      const endDate = new Date(studyPlan.end_date);
      const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      const targetHours = Math.round(studyPlan.total_duration_hours * totalWeeks);

      // Create the goal
      const goalData = {
        user_id: user.id,
        title: `${studyPlan.title} - Study Goal`,
        description: `Converted from study plan: ${studyPlan.title}`,
        target_hours: targetHours,
        start_date: studyPlan.start_date,
        end_date: studyPlan.end_date,
        academic_subject: studyPlan.subject,
        is_completed: false,
        progress: 0
      };

      const { error: goalError } = await supabase
        .from('study_goals')
        .insert(goalData);

      if (goalError) throw goalError;

      // Update the study plan to mark it as converted
      const { error: updateError } = await supabase
        .from('study_plans')
        .update({ is_converted_to_goals: true })
        .eq('id', studyPlan.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast.success('Study plan successfully converted to goal!');
    },
    onError: (error) => {
      console.error('Error converting study plan to goal:', error);
      toast.error('Failed to convert study plan to goal');
    }
  });

  return {
    convertToGoal: mutation.mutateAsync,
    isLoading: mutation.isPending
  };
};
