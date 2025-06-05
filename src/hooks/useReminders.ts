
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth"; 
import { useReminderNotifications } from "./useReminderNotifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addDays, addWeeks, addMonths, format } from "date-fns";

export type ReminderStatus = 'pending' | 'sent' | 'cancelled';
export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type DeliveryMethod = 'in_app' | 'email' | 'whatsapp';
export type ReminderType = 'study_event' | 'goal_deadline' | 'flashcard_review' | 'study' | 'event' | 'goal' | 'todo' | 'other';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  due_date?: string | null;
  type: ReminderType;
  status: ReminderStatus;
  event_id?: string;
  goal_id?: string;
  delivery_methods: DeliveryMethod[];
  recurrence: ReminderRecurrence;
  created_at: string;
  updated_at: string;
  events?: any;
  goals?: any;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  reminder_time: Date;
  type: ReminderType;
  event_id?: string;
  goal_id?: string;
  delivery_methods: DeliveryMethod[];
  recurrence: ReminderRecurrence;
}

export interface ReminderFormValues {
  title: string;
  description?: string;
  reminder_time: string;
  type: ReminderType;
  event_id?: string;
  goal_id?: string;
  delivery_methods: DeliveryMethod[];
  recurrence: ReminderRecurrence;
}

export const useReminders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Query for active reminders
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
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

      // Transform the data to match our type
      return (data || []).map(item => ({
        ...item,
        type: item.type as ReminderType,
        status: item.status as ReminderStatus,
        delivery_methods: Array.isArray(item.delivery_methods) 
          ? item.delivery_methods as DeliveryMethod[]
          : ['in_app' as DeliveryMethod]
      })) as Reminder[];
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
    isLoading: isLoading || remindersLoading,
    createReminder,
    cancelReminder,
    dismissReminder,
    formatReminderTime,
    getNextRecurrenceDate
  };
};
