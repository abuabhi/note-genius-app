
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteStudyPlan = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (planId: string): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('study_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['completed-study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['study-planner-stats'] });
      toast.success('Study plan deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete study plan');
      console.error('Error deleting study plan:', error);
    }
  });

  return {
    deleteStudyPlan: mutation.mutateAsync,
    isLoading: mutation.isPending
  };
};
