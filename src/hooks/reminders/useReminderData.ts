
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Reminder, ReminderStatus, ReminderType, ReminderRecurrence, DeliveryMethod } from './types';

export const useReminderData = () => {
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
        .limit(20);

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
      const today = now.toISOString().split('T')[0];
      
      const dueReminders = typedReminders.filter(r => {
        const reminderTimeDue = r.reminder_time && new Date(r.reminder_time) <= now;
        const dueDateDue = r.type === 'todo' && r.due_date && r.due_date <= today;
        return reminderTimeDue || dueDateDue;
      });
      
      console.log('⏰ Due reminders (should show notifications):', dueReminders);
      console.log('📅 Checking due dates - today:', today);
      
      setPendingReminders(typedReminders);
      
      // Count unread (sent but not dismissed)
      const unreadReminders = typedReminders.filter(r => r.status === 'sent');
      setUnreadCount(unreadReminders.length);
      
      console.log('🔔 Unread count for bell badge:', unreadReminders.length);

      // Auto-process due reminders if any are still pending
      const duePendingReminders = dueReminders.filter(r => r.status === 'pending');
      if (duePendingReminders.length > 0) {
        console.log('🔄 Auto-processing due pending reminders:', duePendingReminders);
        // Return the due pending reminders to be processed
        return duePendingReminders;
      }
    } catch (error) {
      console.error('❌ Error fetching pending reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    pendingReminders,
    setPendingReminders,
    unreadCount,
    setUnreadCount,
    loading,
    fetchPendingReminders
  };
};
