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
    data: todos = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["todos", user?.id, filter],
    queryFn: async () => {
      if (!user) return [];

      const query = supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'todo');
      
      if (filter !== 'all') {
        query.eq('status', filter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

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

      const { data, error } = await supabase
        .from('reminders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('type', 'todo')
        .select();

      if (error) {
        console.error('Error updating todo status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: () => {
      toast.error('Failed to update todo status');
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
