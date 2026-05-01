import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { GanttPlan } from '@/types/gantt';
import { toast } from 'sonner';

export const ganttPlansKey = (uid?: string) => ['gantt-plans', uid] as const;

interface RawPlan {
  id: string;
  title: string;
  exam_id: string | null;
  created_at: string;
  updated_at: string;
}

const toPlan = (r: RawPlan): GanttPlan => ({
  id: r.id,
  title: r.title,
  examId: r.exam_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function useGanttPlans() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ganttPlansKey(user?.id),
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gantt_plans')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as RawPlan[]).map(toPlan);
    },
  });

  const createPlan = useMutation({
    mutationFn: async (input: { title: string; examId?: string | null }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('gantt_plans')
        .insert({
          user_id: user.id,
          title: input.title,
          exam_id: input.examId ?? null,
        })
        .select('*')
        .single();
      if (error) throw error;
      return toPlan(data as RawPlan);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ganttPlansKey(user?.id) }),
    onError: (e: any) => toast.error(e.message ?? 'Failed to create plan'),
  });

  const renamePlan = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from('gantt_plans')
        .update({ title })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ganttPlansKey(user?.id) }),
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gantt_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ganttPlansKey(user?.id) }),
  });

  return {
    plans: query.data ?? [],
    isLoading: query.isLoading,
    createPlan: createPlan.mutateAsync,
    renamePlan: renamePlan.mutateAsync,
    deletePlan: deletePlan.mutateAsync,
  };
}
