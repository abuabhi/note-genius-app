
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ReminderType = 'study_event' | 'goal_deadline' | 'flashcard_review';
export type ReminderStatus = 'pending' | 'sent' | 'dismissed';
export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type DeliveryMethod = 'in_app' | 'email' | 'whatsapp';

export type Reminder = {
  id: string;
  title: string;
  description: string | null;
  reminder_time: string;
  type: ReminderType;
  delivery_methods: DeliveryMethod[];
  status: ReminderStatus;
  recurrence: ReminderRecurrence;
  event_id?: string;
  goal_id?: string;
  created_at: string;
  user_id: string;
};

export type ReminderFormValues = Omit<Reminder, 'id' | 'created_at' | 'status' | 'user_id'> & {
  id?: string;
};

export const useReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('reminder_time', { ascending: true });

      if (error) throw error;
      
      // Transform the data to ensure it matches our Reminder type
      const typedReminders = data?.map(item => ({
        ...item,
        type: item.type as ReminderType,
        status: item.status as ReminderStatus,
        recurrence: item.recurrence as ReminderRecurrence,
        delivery_methods: (Array.isArray(item.delivery_methods) ? 
          item.delivery_methods : 
          ['in_app']) as DeliveryMethod[]
      })) || [];
      
      setReminders(typedReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (reminderData: ReminderFormValues) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminderData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform the returned data to match our Reminder type
      const newReminder: Reminder = {
        ...data,
        type: data.type as ReminderType,
        status: data.status as ReminderStatus,
        recurrence: data.recurrence as ReminderRecurrence,
        delivery_methods: (Array.isArray(data.delivery_methods) ? 
          data.delivery_methods : 
          ['in_app']) as DeliveryMethod[]
      };
      
      setReminders((prev) => [...prev, newReminder]);
      toast.success('Reminder created successfully');
      return newReminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
      return null;
    }
  };

  const updateReminder = async (id: string, reminderData: Partial<ReminderFormValues>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reminders')
        .update(reminderData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setReminders((prev) => 
        prev.map((reminder) => 
          reminder.id === id ? { ...reminder, ...reminderData } : reminder
        )
      );
      
      toast.success('Reminder updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
      return false;
    }
  };

  const deleteReminder = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
      toast.success('Reminder deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
      return false;
    }
  };

  const dismissReminder = async (id: string) => {
    return updateReminder(id, { status: 'dismissed' as ReminderStatus });
  };

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  return {
    reminders,
    loading,
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    dismissReminder,
  };
};
