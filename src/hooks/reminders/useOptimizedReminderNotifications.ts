
import { useState, useEffect, useCallback } from 'react';
import { useUnifiedReminderSystem } from '../useUnifiedReminderSystem';
import { useAuth } from '@/contexts/auth';
import { Reminder } from './types';

// Optimized notification system using unified system internally
export const useOptimizedReminderNotifications = () => {
  const { user } = useAuth();
  const [hasNotified, setHasNotified] = useState(new Set<string>());

  console.log('🔔 OptimizedReminderNotifications now using unified system internally');

  // Use unified system internally
  const { 
    reminders, 
    isLoading, 
    dismissReminder: unifiedDismiss, 
    batchDismissReminders: unifiedBatchDismiss,
    isDismissing 
  } = useUnifiedReminderSystem({
    enableRealtime: true,
    enableNotifications: true,
  });

  // Calculate unread count (sent reminders)
  const unreadCount = reminders.filter(r => r.status === 'sent').length;

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

    console.log('⏰ Processing due reminders via unified system:', dueReminders.length);

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
  }, [reminders, hasNotified]);

  // Process due reminders when reminders change
  useEffect(() => {
    processDueReminders();
  }, [processDueReminders]);

  // Request notification permission
  useEffect(() => {
    if (!user) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }

    console.log('🚀 Optimized notification system initialized with unified backend');
  }, [user]);

  const dismissAll = useCallback(async () => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      console.log('🗑️ OptimizedNotifications dismissing all via unified system:', sentReminderIds.length);
      unifiedBatchDismiss(sentReminderIds);
      setHasNotified(new Set());
    }
  }, [reminders, unifiedBatchDismiss]);

  const dismissSingle = useCallback(async (id: string) => {
    console.log('🗑️ OptimizedNotifications dismissing single via unified system:', id);
    unifiedDismiss(id);
    setHasNotified(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, [unifiedDismiss]);

  return {
    reminders,
    unreadCount,
    isLoading,
    isDismissing,
    dismissReminder: dismissSingle,
    dismissAll,
    refresh: () => {}, // No manual refresh needed with unified system
  };
};
