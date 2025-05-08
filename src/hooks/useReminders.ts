
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Reminder = {
  id: string;
  title: string;
  description: string | null;
  reminder_time: string;
  type: 'study_event' | 'goal_deadline' | 'flashcard_review';
  delivery_methods: string[];
  status: 'pending' | 'sent' | 'dismissed';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  event_id?: string;
  goal_id?: string;
  created_at: string;
};

export type ReminderFormValues = Omit<Reminder, 'id' | 'created_at' | 'status'> & {
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
      setReminders(data || []);
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
      
      setReminders((prev) => [...prev, data]);
      toast.success('Reminder created successfully');
      return data;
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
    return updateReminder(id, { status: 'dismissed' });
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
