import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth'; // Updated import path
import { supabase } from '@/integrations/supabase/client';
import { Reminder, ReminderStatus, ReminderRecurrence, ReminderType, DeliveryMethod } from '@/hooks/useReminders';

export const useReminderNotifications = () => {
  const { user } = useAuth();
  const [pendingReminders, setPendingReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchPendingReminders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('📥 Fetching pending reminders for user:', user.id);
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .order('reminder_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      console.log('📥 Raw reminders from database:', data);
      
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
      
      console.log('📥 Processed reminders:', typedReminders);
      
      // Check which reminders are due
      const now = new Date();
      const dueReminders = typedReminders.filter(r => new Date(r.reminder_time) <= now);
      console.log('⏰ Due reminders (should show notifications):', dueReminders);
      
      setPendingReminders(typedReminders);
      
      // Count unread (sent but not dismissed)
      const unreadReminders = typedReminders.filter(r => r.status === 'sent');
      setUnreadCount(unreadReminders.length);
      
      console.log('🔔 Unread count for bell badge:', unreadReminders.length);
    } catch (error) {
      console.error('❌ Error fetching pending reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissReminder = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'dismissed' as ReminderStatus })
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
        .update({ status: 'dismissed' as ReminderStatus })
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

  // Manual function to process due reminders (for testing)
  const processReminders = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Manually processing reminders...');
      const response = await fetch(`https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/process-reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw`
        }
      });
      
      const result = await response.json();
      console.log('🔄 Process reminders result:', result);
      
      // Refresh reminders after processing
      await fetchPendingReminders();
    } catch (error) {
      console.error('❌ Error processing reminders:', error);
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
          console.log('🔄 Real-time reminder change detected, refreshing...');
          // Refresh reminders when changes occur
          fetchPendingReminders();
        }
      )
      .subscribe();
      
    // Run the fetchPendingReminders function every 60 seconds to keep it updated
    const intervalId = setInterval(() => {
      console.log('🔄 Periodic reminder check...');
      fetchPendingReminders();
    }, 60000);

    // Also run manual processing every 2 minutes to ensure reminders get processed
    const processingIntervalId = setInterval(() => {
      console.log('🔄 Periodic reminder processing...');
      processReminders();
    }, 120000); // 2 minutes

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
      clearInterval(processingIntervalId);
    };
  }, [user]);

  return {
    pendingReminders,
    unreadCount,
    loading,
    dismissReminder,
    dismissAll,
    refresh: fetchPendingReminders,
    processReminders, // Export for manual testing
  };
};
