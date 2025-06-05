import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export type TodoPriority = "low" | "medium" | "high";
export type TodoStatus = "pending" | "completed" | "cancelled";

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  reminder_time?: Date | null;
  priority: TodoPriority;
}

export const useTodos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<TodoStatus | 'all'>('all');

  // Query for todos
  const { 
    data: allTodos = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["todos", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'todo')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
        throw error;
      }

      // Transform the data to include a priority property since it might not exist in all records
      return data.map(item => {
        // Type assertion for the item with an optional priority field
        const typedItem = item as any;
        console.log('📋 Todo fetched from DB:', {
          id: typedItem.id,
          title: typedItem.title,
          priority: typedItem.priority,
          rawItem: typedItem
        });
        return {
          ...typedItem,
          priority: (typedItem.priority as TodoPriority) || 'medium',
        } as Todo;
      });
    },
    enabled: !!user,
  });

  // Filter todos based on the current filter and due status
  const todos = allTodos.filter(todo => {
    if (filter === 'all') return true;
    
    if (filter === 'pending') {
      // Include all pending todos, regardless of due status
      return todo.status === 'pending';
    }
    
    return todo.status === filter;
  });

  // Mutation to create a todo
  const createTodo = useMutation({
    mutationFn: async (todoData: CreateTodoData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📝 Creating todo with data:', {
        title: todoData.title,
        priority: todoData.priority,
        reminder_time: todoData.reminder_time,
        fullData: todoData
      });

      const insertData = {
        user_id: user.id,
        title: todoData.title,
        description: todoData.description,
        reminder_time: todoData.reminder_time ? todoData.reminder_time.toISOString() : null,
        type: 'todo',
        status: 'pending',
        priority: todoData.priority,
        delivery_methods: ['in_app'],
      };

      console.log('🗄️ Inserting into database:', insertData);

      const { data, error } = await supabase
        .from('reminders')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Error creating todo:', error);
        throw error;
      }

      console.log('✅ Todo created successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Todo created successfully');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create todo: ${error.message}`);
    },
  });

  // Mutation to update a todo status
  const updateTodoStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: TodoStatus }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📝 Updating todo status:', { id, status, userId: user.id });

      // Map our status values to the database constraint values
      let databaseStatus: string = status;
      if (status === 'completed') {
        databaseStatus = 'sent'; // Use 'sent' instead of 'completed' based on database constraint
      }

      const { data, error } = await supabase
        .from('reminders')
        .update({ 
          status: databaseStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('type', 'todo')
        .select();

      if (error) {
        console.error('Error updating todo status:', error);
        throw error;
      }

      console.log('✅ Todo status updated successfully:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('🎉 Todo status update success:', variables);
      toast.success(`Todo marked as ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      // Also invalidate reminders to update notification status
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: (error: Error) => {
      console.error('❌ Todo status update error:', error);
      toast.error(`Failed to update todo: ${error.message}`);
    },
  });

  // Mutation to delete a todo
  const deleteTodo = useMutation({
    mutationFn: async (todoId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', todoId)
        .eq('user_id', user.id)
        .eq('type', 'todo');

      if (error) {
        console.error('Error deleting todo:', error);
        throw error;
      }

      return todoId;
    },
    onSuccess: () => {
      toast.success('Todo deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: () => {
      toast.error('Failed to delete todo');
    },
  });

  // Format date helper function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    try {
      return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return 'Invalid date';
    }
  };

  return {
    todos,
    isLoading,
    error,
    createTodo,
    updateTodoStatus,
    deleteTodo,
    formatDate,
    filter,
    setFilter
  };
};
