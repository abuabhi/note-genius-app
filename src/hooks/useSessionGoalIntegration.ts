
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useSessionGoalIntegration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get goals that can be linked to sessions
  const { data: linkableGoals = [] } = useQuery({
    queryKey: ['linkable-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('study_goals')
        .select('id, title, description, academic_subject, target_hours, progress, end_date')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('end_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get todos that can be linked to sessions
  const { data: linkableTodos = [] } = useQuery({
    queryKey: ['linkable-todos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('reminders')
        .select('id, title, description, due_date, priority')
        .eq('user_id', user.id)
        .eq('type', 'todo')
        .eq('status', 'pending')
        .order('due_date', { ascending: true, nullsFirst: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Link session to goal
  const linkToGoalMutation = useMutation({
    mutationFn: async ({ sessionId, goalId }: { sessionId: string; goalId: string }) => {
      // We'll store the relationship in session completion notes for now
      // In a real app, you might want a separate linking table
      const { data, error } = await supabase
        .from('study_plan_sessions')
        .update({
          completion_notes: `Linked to goal: ${goalId}`
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan-sessions'] });
      toast.success('Session linked to goal successfully!');
    },
  });

  // Link session to todo
  const linkToTodoMutation = useMutation({
    mutationFn: async ({ sessionId, todoId }: { sessionId: string; todoId: string }) => {
      const { data, error } = await supabase
        .from('study_plan_sessions')
        .update({
          completion_notes: `Linked to todo: ${todoId}`
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan-sessions'] });
      toast.success('Session linked to todo successfully!');
    },
  });

  // Complete linked todo when session is completed
  const completeLinkedTodoMutation = useMutation({
    mutationFn: async (todoId: string) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({ status: 'completed' })
        .eq('id', todoId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linkable-todos'] });
      toast.success('Linked todo completed!');
    },
  });

  return {
    linkableGoals,
    linkableTodos,
    linkToGoal: linkToGoalMutation.mutateAsync,
    linkToTodo: linkToTodoMutation.mutateAsync,
    completeLinkedTodo: completeLinkedTodoMutation.mutateAsync,
    isLinking: linkToGoalMutation.isPending || linkToTodoMutation.isPending,
  };
};
