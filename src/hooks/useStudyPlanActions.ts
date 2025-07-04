import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStudyPlanActions = () => {
  const queryClient = useQueryClient();

  const extendPlanMutation = useMutation({
    mutationFn: async ({ planId, newEndDate }: { planId: string; newEndDate: string }) => {
      const { data, error } = await supabase
        .from('study_plans')
        .update({ 
          end_date: newEndDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-study-plans'] });
      toast.success('Study plan deadline extended successfully');
    },
    onError: (error) => {
      console.error('Error extending study plan:', error);
      toast.error('Failed to extend study plan deadline');
    },
  });

  const completePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('study_plans')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-study-plans'] });
      toast.success('Study plan marked as completed');
    },
    onError: (error) => {
      console.error('Error completing study plan:', error);
      toast.error('Failed to mark study plan as completed');
    },
  });

  return {
    extendPlan: extendPlanMutation.mutate,
    completePlan: completePlanMutation.mutate,
    isExtending: extendPlanMutation.isPending,
    isCompleting: completePlanMutation.isPending,
  };
};