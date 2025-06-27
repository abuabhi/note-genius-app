
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface Todo {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

// Simplified todos hook with user-scoped query keys for SaaS scalability
export const useSimplifiedTodos = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch todos with user-scoped query key for proper isolation
  const { data: todos = [], isLoading, error } = useQuery({
    queryKey: ['todos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'todo')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Todo[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes - consistent cache strategy
    gcTime: 5 * 60 * 1000, // 5 minutes cache retention
    refetchOnWindowFocus: true, // Auto-refresh when window regains focus
  });

  // Create todo mutation with optimistic updates
  const createTodoMutation = useMutation({
    mutationFn: async (todoData: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...todoData,
          user_id: user.id,
          type: 'todo',
          reminder_time: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] });
      
      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(['todos', user?.id]);
      
      // Optimistically update cache
      queryClient.setQueryData(['todos', user?.id], (old: Todo[] = []) => [
        {
          ...newTodo,
          id: 'temp-' + Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...old,
      ]);
      
      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos);
      }
      console.error('Error creating todo:', err);
      toast.error('Failed to create todo');
    },
    onSuccess: () => {
      // Invalidate and refetch to get server data
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] });
      toast.success('Todo created successfully');
    },
  });

  // Update todo mutation with optimistic updates
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Todo> }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] });
      
      const previousTodos = queryClient.getQueryData(['todos', user?.id]);
      
      queryClient.setQueryData(['todos', user?.id], (old: Todo[] = []) =>
        old.map(todo => 
          todo.id === id 
            ? { ...todo, ...updates, updated_at: new Date().toISOString() }
            : todo
        )
      );
      
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos);
      }
      console.error('Error updating todo:', err);
      toast.error('Failed to update todo');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] });
      toast.success('Todo updated successfully');
    },
  });

  // Delete todo mutation with optimistic updates
  const deleteTodoMutation = useMutation({
    mutationFn: async (todoId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', todoId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onMutate: async (todoId) => {
      await queryClient.cancelQueries({ queryKey: ['todos', user?.id] });
      
      const previousTodos = queryClient.getQueryData(['todos', user?.id]);
      
      queryClient.setQueryData(['todos', user?.id], (old: Todo[] = []) =>
        old.filter(todo => todo.id !== todoId)
      );
      
      return { previousTodos };
    },
    onError: (err, todoId, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', user?.id], context.previousTodos);
      }
      console.error('Error deleting todo:', err);
      toast.error('Failed to delete todo');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', user?.id] });
      toast.success('Todo deleted successfully');
    },
  });

  return {
    // Data
    todos,
    isLoading,
    error,
    
    // Mutations
    createTodo: createTodoMutation.mutate,
    updateTodo: updateTodoMutation.mutate,
    deleteTodo: deleteTodoMutation.mutate,
    
    // Loading states
    isCreating: createTodoMutation.isPending,
    isUpdating: updateTodoMutation.isPending,
    isDeleting: deleteTodoMutation.isPending,
  };
};
