
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

// Simplified todos hook
export const useSimplifiedTodos = () => {
  const queryClient = useQueryClient();

  // Fetch todos with simple query
  const { data: todos = [], isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('type', 'todo')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Todo[];
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Create todo mutation
  const createTodoMutation = useMutation({
    mutationFn: async (todoData: Omit<Todo, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...todoData,
          type: 'todo',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo created successfully');
    },
    onError: (error) => {
      console.error('Error creating todo:', error);
      toast.error('Failed to create todo');
    },
  });

  // Update todo mutation
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Todo> }) => {
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo updated successfully');
    },
    onError: (error) => {
      console.error('Error updating todo:', error);
      toast.error('Failed to update todo');
    },
  });

  // Delete todo mutation
  const deleteTodoMutation = useMutation({
    mutationFn: async (todoId: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', todoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Todo deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete todo');
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
