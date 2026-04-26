import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import type { AdminTodo, AdminTodoInput, AdminTodoStatus } from '@/types/adminTodo';

const KEY = ['admin-todos'] as const;

export function useAdminTodos() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_todos' as any)
        .select('*')
        .order('status', { ascending: true })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AdminTodo[];
    },
  });

  const create = useMutation({
    mutationFn: async (input: AdminTodoInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('admin_todos' as any)
        .insert({
          title: input.title,
          description: input.description ?? null,
          status: input.status ?? 'todo',
          priority: input.priority ?? 'medium',
          due_date: input.due_date ?? null,
          created_by: user.id,
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as AdminTodo;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Task added');
    },
    onError: (e: any) => toast.error(e.message ?? 'Failed to add task'),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<AdminTodo> & { id: string }) => {
      const { data, error } = await supabase
        .from('admin_todos' as any)
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as unknown as AdminTodo;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e: any) => toast.error(e.message ?? 'Failed to update task'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_todos' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Task deleted');
    },
    onError: (e: any) => toast.error(e.message ?? 'Failed to delete task'),
  });

  const setStatus = (id: string, status: AdminTodoStatus) =>
    update.mutateAsync({ id, status });

  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createTodo: create.mutateAsync,
    updateTodo: update.mutateAsync,
    deleteTodo: remove.mutateAsync,
    setStatus,
  };
}
