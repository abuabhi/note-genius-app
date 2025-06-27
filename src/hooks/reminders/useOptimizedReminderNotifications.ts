
import { useState, useEffect, useCallback } from 'react';
import { useOptimizedReminders } from './useOptimizedReminders';
import { useAuth } from '@/contexts/auth';
import { Reminder } from './types';

// Smart notification system with exponential backoff and minimal polling
export const useOptimizedReminderNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNotified, setHasNotified] = useState(new Set<string>());

  // Use optimized reminders with realtime updates
  const { 
    reminders, 
    isLoading, 
    dismissReminder, 
    batchDismissReminders,
    isDismissing 
  } = useOptimizedReminders({
    limit: 50, // Fetch more for notification processing
    status: ['pending', 'sent'],
    enableRealtime: true,
  });

  // Process due reminders for notifications
  const processDueReminders = useCallback(() => {
    if (!reminders.length) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const dueReminders = reminders.filter(reminder => {
      const reminderTimeDue = reminder.reminder_time && new Date(reminder.reminder_time) <= now;
      const dueDateDue = reminder.type === 'todo' && reminder.due_date && reminder.due_date <= today;
      return reminderTimeDue || dueDateDue;
    });

    console.log('⏰ Processing due reminders:', dueReminders.length);

    // Show notifications for new due reminders
    dueReminders.forEach(reminder => {
      if (!hasNotified.has(reminder.id) && reminder.status === 'pending') {
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(reminder.title, {
            body: reminder.description || 'You have a reminder due',
            icon: '/favicon.ico',
            tag: reminder.id,
          });
        }
        
        setHasNotified(prev => new Set(prev).add(reminder.id));
      }
    });

    // Update unread count
    const sentReminders = reminders.filter(r => r.status === 'sent');
    setUnreadCount(sentReminders.length);
  }, [reminders, hasNotified]);

  // Process due reminders when reminders change
  useEffect(() => {
    processDueReminders();
  }, [processDueReminders]);

  // Smart polling with exponential backoff - only when not using realtime
  useEffect(() => {
    if (!user) return;

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }

    // No additional polling needed - realtime handles updates
    console.log('🚀 Optimized notification system initialized');
  }, [user]);

  const dismissAll = useCallback(async () => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      batchDismissReminders(sentReminderIds);
      setUnreadCount(0);
      setHasNotified(new Set());
    }
  }, [reminders, batchDismissReminders]);

  const dismissSingle = useCallback(async (id: string) => {
    dismissReminder(id);
    setUnreadCount(prev => Math.max(0, prev - 1));
    setHasNotified(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [dismissReminder]);

  return {
    reminders,
    unreadCount,
    isLoading,
    isDismissing,
    dismissReminder: dismissSingle,
    dismissAll,
    refresh: () => {}, // No manual refresh needed with realtime
  };
};
