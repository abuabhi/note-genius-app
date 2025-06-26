
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteStudyPlan = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (planId: string): Promise<void> => {
      const { error } = await supabase
        .from('study_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['completed-study-plans'] });
      toast.success('Study plan deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting study plan:', error);
      toast.error('Failed to delete study plan');
    }
  });

  return {
    deleteStudyPlan: mutation.mutateAsync,
    isLoading: mutation.isPending
  };
};
