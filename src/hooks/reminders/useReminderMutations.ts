
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { CreateReminderData } from "./types";

export const useReminderMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mutation to create a reminder
  const createReminder = useMutation({
    mutationFn: async (reminderData: CreateReminderData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: reminderData.title,
          description: reminderData.description,
          reminder_time: reminderData.reminder_time.toISOString(),
          type: reminderData.type,
          event_id: reminderData.event_id,
          goal_id: reminderData.goal_id,
          delivery_methods: reminderData.delivery_methods,
          recurrence: reminderData.recurrence,
          status: 'pending'
        })
        .select();

      if (error) {
        console.error('Error creating reminder:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Reminder created successfully');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create reminder: ${error.message}`);
    },
  });

  // Mutation to cancel a reminder
  const cancelReminder = useMutation({
    mutationFn: async (reminderId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .update({ status: 'cancelled' })
        .eq('id', reminderId)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error cancelling reminder:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Reminder cancelled');
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: () => {
      toast.error('Failed to cancel reminder');
    },
  });

  // Mutation to dismiss a reminder
  const dismissReminder = useMutation({
    mutationFn: async (reminderId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .update({ status: 'sent' })
        .eq('id', reminderId)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error dismissing reminder:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: () => {
      toast.error('Failed to dismiss reminder');
    },
  });

  return {
    createReminder,
    cancelReminder,
    dismissReminder
  };
};
