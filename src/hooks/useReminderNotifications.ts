
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Reminder, DeliveryMethod, ReminderStatus, ReminderRecurrence, ReminderType } from '@/hooks/useReminders';

export const useReminderNotifications = () => {
  const { user } = useAuth();
  const [pendingReminders, setPendingReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchPendingReminders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .order('reminder_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform to ensure it matches our Reminder type
      const typedReminders = data?.map(item => ({
        ...item,
        type: item.type as ReminderType,
        status: item.status as ReminderStatus,
        recurrence: item.recurrence as ReminderRecurrence,
        delivery_methods: (Array.isArray(item.delivery_methods) ? 
          item.delivery_methods as DeliveryMethod[] : 
          ['in_app' as DeliveryMethod])
      })) || [];
      
      setPendingReminders(typedReminders);
      
      // Count unread (sent but not dismissed)
      setUnreadCount(typedReminders.filter(r => r.status === 'sent').length);
    } catch (error) {
      console.error('Error fetching pending reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissReminder = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'dismissed' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPendingReminders(prev => 
        prev.filter(reminder => reminder.id !== id)
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      return false;
    }
  };

  const dismissAll = async () => {
    if (!user || pendingReminders.length === 0) return false;

    try {
      const sentReminderIds = pendingReminders
        .filter(r => r.status === 'sent')
        .map(r => r.id);
      
      if (sentReminderIds.length === 0) return true;
      
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'dismissed' })
        .in('id', sentReminderIds)
        .eq('user_id', user.id);

      if (error) throw error;

      setPendingReminders(prev => 
        prev.filter(reminder => reminder.status !== 'sent')
      );
      
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error dismissing all reminders:', error);
      return false;
    }
  };

  // Set up real-time subscription for new reminders
  useEffect(() => {
    if (!user) return;
    
    fetchPendingReminders();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('reminder-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh reminders when changes occur
          fetchPendingReminders();
        }
      )
      .subscribe();
      
    // Run the fetchPendingReminders function every 60 seconds to keep it updated
    const intervalId = setInterval(fetchPendingReminders, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [user]);

  return {
    pendingReminders,
    unreadCount,
    loading,
    dismissReminder,
    dismissAll,
    refresh: fetchPendingReminders,
  };
};
