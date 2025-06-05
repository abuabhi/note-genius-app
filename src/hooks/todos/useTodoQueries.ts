
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

      console.log('🔍 Fetching todos for user:', user.id);

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'todo')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching todos:', error);
        throw error;
      }

      console.log('📥 Raw todos from database:', data);

      // Transform the data and properly map database status to TodoStatus
      const transformedTodos = data.map(item => {
        const typedItem = item as any;
        console.log('🔄 Processing todo:', {
          id: typedItem.id,
          title: typedItem.title,
          priority: typedItem.priority,
          dbStatus: typedItem.status,
          rawItem: typedItem
        });
        
        const mappedStatus = mapDatabaseStatusToTodoStatus(typedItem.status);
        console.log('📋 Status mapping result:', { 
          dbStatus: typedItem.status, 
          mappedStatus,
          title: typedItem.title 
        });
        
        return {
          ...typedItem,
          status: mappedStatus,
          priority: (typedItem.priority as TodoPriority) || 'medium',
        } as Todo;
      });

      console.log('✅ Final transformed todos:', transformedTodos.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status
      })));

      return transformedTodos;
    },
    enabled: !!user,
  });

  console.log('📊 Final allTodos in hook:', allTodos.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status
  })));

  return {
    allTodos,
    isLoading,
    error
  };
};
