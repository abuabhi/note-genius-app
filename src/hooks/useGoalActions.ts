import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useGoalActions = () => {
  const queryClient = useQueryClient();

  const extendGoalMutation = useMutation({
    mutationFn: async ({ goalId, newEndDate }: { goalId: string; newEndDate: string }) => {
      const { data, error } = await supabase
        .from('study_goals')
        .update({ 
          end_date: newEndDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast.success('Goal deadline extended successfully');
    },
    onError: (error) => {
      console.error('Error extending goal:', error);
      toast.error('Failed to extend goal deadline');
    },
  });

  const markGoalCompleteMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { data, error } = await supabase
        .from('study_goals')
        .update({ 
          is_completed: true,
          progress: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast.success('🎉 Goal marked as completed! Amazing work!');
    },
    onError: (error) => {
      console.error('Error completing goal:', error);
      toast.error('Failed to mark goal as completed');
    },
  });

  return {
    extendGoal: extendGoalMutation.mutate,
    markGoalComplete: markGoalCompleteMutation.mutate,
    isExtending: extendGoalMutation.isPending,
    isCompleting: markGoalCompleteMutation.isPending,
  };
};