// @ts-nocheck

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface SimpleReminder {
  id: string;
  user_id: string;
  title: string;
  description: string;
  reminder_time: string;
  due_date: string;
  type: string;
  status: string;
  recurrence: string;
  delivery_methods: string[];
  priority: string;
  created_at: string;
  updated_at: string;
  events: { id: string; title: string }[];
  goals: { id: string; title: string }[];
}

interface UseUnifiedReminderSystemResult {
  reminders: SimpleReminder[] | undefined;
  isLoading: boolean;
  error: any;
  createReminder: (newReminder: Omit<SimpleReminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateReminder: (reminderId: string, updates: Partial<Omit<SimpleReminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
}

export const useUnifiedReminderSystem = (): UseUnifiedReminderSystemResult => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: reminders,
    isLoading,
    error,
  } = useQuery<SimpleReminder[]>({
    queryKey: ['reminders', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("No user logged in")
        return [];
      }

      const { data, error } = await supabase
        .from('reminders')
        .select(`
          id,
          user_id,
          title,
          description,
          reminder_time,
          due_date,
          type,
          status,
          recurrence,
          delivery_methods,
          priority,
          created_at,
          updated_at,
          events (
            id,
            title
          ),
          goals (
            id,
            title
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching reminders:", error);
        throw error;
      }

      // Type assertion here
      return data as unknown as SimpleReminder[];
    },
    enabled: !!user,
  });

  const createReminder = async (newReminder: Omit<SimpleReminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .insert([
          {
            ...newReminder,
            user_id: user.id,
          },
        ]);

      if (error) {
        console.error("Error creating reminder:", error);
        throw error;
      }

      // Invalidate and refetch query
      await queryClient.invalidateQueries(['reminders', user.id]);
    } catch (err) {
      console.error("Failed to create reminder:", err);
      throw err;
    }
  };

  const updateReminder = async (reminderId: string, updates: Partial<Omit<SimpleReminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error updating reminder:", error);
        throw error;
      }

      // Invalidate and refetch query
      await queryClient.invalidateQueries(['reminders', user.id]);
    } catch (err) {
      console.error("Failed to update reminder:", err);
      throw err;
    }
  };

  const deleteReminder = async (reminderId: string) => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting reminder:", error);
        throw error;
      }

      // Invalidate and refetch query
      await queryClient.invalidateQueries(['reminders', user.id]);
    } catch (err) {
      console.error("Failed to delete reminder:", err);
      throw err;
    }
  };

  return {
    reminders,
    isLoading,
    error,
    createReminder,
    updateReminder,
    deleteReminder,
  };
};
