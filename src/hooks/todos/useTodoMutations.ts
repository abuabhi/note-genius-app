
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { CreateTodoData, TodoStatus } from "./types";
import { mapTodoStatusToDatabaseStatus } from "./utils";

export const useTodoMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mutation to create a todo
  const createTodo = useMutation({
    mutationFn: async (todoData: CreateTodoData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📝 Creating todo with data:', todoData);

      const insertData = {
        user_id: user.id,
        title: todoData.title,
        description: todoData.description,
        reminder_time: todoData.reminder_time ? todoData.reminder_time.toISOString() : new Date().toISOString(),
        due_date: todoData.due_date ? todoData.due_date.toISOString().split('T')[0] : null,
        type: 'todo',
        status: 'pending', // Changed from 'new' to 'pending' to match constraint
        priority: todoData.priority,
        recurrence: todoData.recurrence || 'none',
        recurrence_end_date: todoData.recurrence_end_date ? todoData.recurrence_end_date.toISOString().split('T')[0] : null,
        depends_on_todo_id: todoData.depends_on_todo_id,
        template_id: todoData.template_id,
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

  return {
    createTodo,
    updateTodoStatus,
    deleteTodo
  };
};
