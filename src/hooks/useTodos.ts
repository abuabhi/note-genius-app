
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

// Helper function to map database status to TodoStatus
const mapDatabaseStatusToTodoStatus = (dbStatus: string): TodoStatus => {
  switch (dbStatus) {
    case 'pending':
      return 'pending';
    case 'sent':
      return 'completed'; // Map 'sent' back to 'completed' for frontend
    case 'dismissed':
      return 'cancelled';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending'; // Default fallback
  }
};

// Helper function to map TodoStatus to database status
const mapTodoStatusToDatabaseStatus = (todoStatus: TodoStatus): string => {
  switch (todoStatus) {
    case 'pending':
      return 'pending';
    case 'completed':
      return 'sent'; // Map 'completed' to 'sent' for database
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
};

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

      // Transform the data and properly map database status to TodoStatus
      return data.map(item => {
        const typedItem = item as any;
        console.log('📋 Todo fetched from DB:', {
          id: typedItem.id,
          title: typedItem.title,
          priority: typedItem.priority,
          dbStatus: typedItem.status,
          rawItem: typedItem
        });
        
        const mappedStatus = mapDatabaseStatusToTodoStatus(typedItem.status);
        console.log('📋 Mapped status:', { dbStatus: typedItem.status, mappedStatus });
        
        return {
          ...typedItem,
          status: mappedStatus,
          priority: (typedItem.priority as TodoPriority) || 'medium',
        } as Todo;
      });
    },
    enabled: !!user,
  });

  // Filter todos based on the current filter
  const todos = allTodos.filter(todo => {
    console.log('🔍 Filtering todo:', { 
      id: todo.id, 
      title: todo.title, 
      status: todo.status, 
      filter, 
      willShow: filter === 'all' || todo.status === filter 
    });
    
    if (filter === 'all') return true;
    return todo.status === filter;
  });

  console.log('📋 Final todos for display:', {
    allTodosCount: allTodos.length,
    filteredTodosCount: todos.length,
    filter,
    allStatuses: allTodos.map(t => ({ id: t.id, status: t.status }))
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

      // Map TodoStatus to database status
      const databaseStatus = mapTodoStatusToDatabaseStatus(status);
      console.log('📝 Status mapping:', { todoStatus: status, databaseStatus });

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
