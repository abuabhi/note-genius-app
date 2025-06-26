
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudyPlan } from '@/types/studyPlanner';
import { toast } from 'sonner';

export const useStartStudySession = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (studyPlan: StudyPlan): Promise<string> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create a new study session
      const sessionData = {
        user_id: user.id,
        title: `Study Session: ${studyPlan.title}`,
        subject: studyPlan.subject,
        notes: `Study session for: ${studyPlan.title}`,
        start_time: new Date().toISOString(),
        is_active: true,
        activity_type: 'study_plan'
      };

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      return data.id;
    },
    onSuccess: (sessionId, studyPlan) => {
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
      toast.success(`Study session started for ${studyPlan.title}`);
      
      // You could navigate to a study session page here if you have one
      // For now, we'll just show the success message
    },
    onError: (error) => {
      console.error('Error starting study session:', error);
      toast.error('Failed to start study session');
    }
  });

  return {
    startSession: mutation.mutateAsync,
    isLoading: mutation.isPending
  };
};
