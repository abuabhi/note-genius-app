
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Todo, TodoPriority } from "./types";
import { mapDatabaseStatusToTodoStatus } from "./utils";

export const useTodoQueries = () => {
  const { user } = useAuth();

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

  return {
    allTodos,
    isLoading,
    error
  };
};
