
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OverdueTodo {
  todo_id: string;
  title: string;
  description?: string;
  due_date: string;
  days_overdue: number;
  in_grace_period: boolean;
  escalation_level: 'normal' | 'urgent' | 'critical';
  priority: string;
}

export interface OverdueTodoActions {
  extendDeadline: (todoId: string, newDate: string) => Promise<void>;
  markUrgent: (todoIds: string[]) => Promise<void>;
  archiveTodos: (todoIds: string[], reason: string) => Promise<void>;
  deleteTodos: (todoIds: string[]) => Promise<void>;
}

export const useOverdueTodoManager = () => {
  const { user } = useAuth();
  const [overdueItems, setOverdueItems] = useState<OverdueTodo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverdueTodos = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_overdue_todos', {
        p_user_id: user.id
      });

      if (error) throw error;

      setOverdueItems(data || []);
    } catch (error) {
      console.error('Error fetching overdue todos:', error);
      toast.error('Failed to load overdue todos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const extendDeadline = useCallback(async (todoId: string, newDate: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          due_date: newDate,
          escalation_level: 'normal',
          updated_at: new Date().toISOString()
        })
        .eq('id', todoId)
        .eq('user_id', user.id)
        .eq('type', 'todo');

      if (error) throw error;

      await fetchOverdueTodos();
      toast.success('Deadline extended successfully');
    } catch (error) {
      console.error('Error extending deadline:', error);
      toast.error('Failed to extend deadline');
    }
  }, [user, fetchOverdueTodos]);

  const markUrgent = useCallback(async (todoIds: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          escalation_level: 'urgent',
          updated_at: new Date().toISOString()
        })
        .in('id', todoIds)
        .eq('user_id', user.id)
        .eq('type', 'todo');

      if (error) throw error;

      await fetchOverdueTodos();
      toast.success(`${todoIds.length} todo(s) marked as urgent`);
    } catch (error) {
      console.error('Error marking todos as urgent:', error);
      toast.error('Failed to mark todos as urgent');
    }
  }, [user, fetchOverdueTodos]);

  const archiveTodos = useCallback(async (todoIds: string[], reason: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          auto_archived_at: new Date().toISOString(),
          archived_reason: reason,
          updated_at: new Date().toISOString()
        })
        .in('id', todoIds)
        .eq('user_id', user.id)
        .eq('type', 'todo');

      if (error) throw error;

      await fetchOverdueTodos();
      toast.success(`${todoIds.length} todo(s) archived`);
    } catch (error) {
      console.error('Error archiving todos:', error);
      toast.error('Failed to archive todos');
    }
  }, [user, fetchOverdueTodos]);

  const deleteTodos = useCallback(async (todoIds: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .in('id', todoIds)
        .eq('user_id', user.id)
        .eq('type', 'todo');

      if (error) throw error;

      await fetchOverdueTodos();
      toast.success(`${todoIds.length} todo(s) deleted`);
    } catch (error) {
      console.error('Error deleting todos:', error);
      toast.error('Failed to delete todos');
    }
  }, [user, fetchOverdueTodos]);

  const actions: OverdueTodoActions = {
    extendDeadline,
    markUrgent,
    archiveTodos,
    deleteTodos
  };

  useEffect(() => {
    fetchOverdueTodos();
  }, [fetchOverdueTodos]);

  return {
    overdueItems,
    loading,
    actions,
    refetch: fetchOverdueTodos
  };
};
