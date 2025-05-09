
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addDays, addWeeks, addMonths } from "date-fns";

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  type: string;
  status: 'pending' | 'sent' | 'cancelled';
  event_id?: string;
  goal_id?: string;
  delivery_methods: string[];
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  reminder_time: Date;
  type: string;
  event_id?: string;
  goal_id?: string;
  delivery_methods: string[];
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
}

export const useReminders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for active reminders
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ["reminders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          events:event_id(*),
          goals:goal_id(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('reminder_time', { ascending: true });

      if (error) {
        console.error('Error fetching reminders:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

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

  // Generate the next recurring date based on recurrence pattern
  const getNextRecurrenceDate = (date: Date, recurrence: string): Date => {
    switch (recurrence) {
      case 'daily':
        return addDays(date, 1);
      case 'weekly':
        return addWeeks(date, 1);
      case 'monthly':
        return addMonths(date, 1);
      default:
        return date;
    }
  };

  // Helper function to format reminder date
  const formatReminderTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return 'Invalid date';
    }
  };

  return {
    reminders,
    isLoading,
    createReminder,
    cancelReminder,
    formatReminderTime,
    getNextRecurrenceDate
  };
};
