
import { useCallback } from 'react';
import { useReminderData } from './reminders/useReminderData';
import { useReminderActions } from './reminders/useReminderActions';
import { useReminderProcessing } from './reminders/useReminderProcessing';
import { useReminderSubscription } from './reminders/useReminderSubscription';

export const useReminderNotifications = () => {
  const {
    pendingReminders,
    setPendingReminders,
    unreadCount,
    setUnreadCount,
    loading,
    fetchPendingReminders
  } = useReminderData();

  const { dismissReminder: dismissReminderAction, dismissAll: dismissAllAction } = useReminderActions();
  const { processReminders, processLocalReminders } = useReminderProcessing();

  const handleFetchAndProcess = useCallback(async () => {
    const duePendingReminders = await fetchPendingReminders();
    if (duePendingReminders && duePendingReminders.length > 0) {
      setTimeout(() => {
        processReminders();
        setTimeout(() => processLocalReminders(duePendingReminders), 1000);
      }, 1000);
    }
  }, [fetchPendingReminders, processReminders, processLocalReminders]);

  const dismissReminder = async (id: string) => {
    const success = await dismissReminderAction(id);
    if (success) {
      setPendingReminders(prev => prev.filter(reminder => reminder.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  };

  const dismissAll = async () => {
    const sentReminderIds = pendingReminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length === 0) return true;
    
    const success = await dismissAllAction(sentReminderIds);
    if (success) {
      setPendingReminders(prev => prev.filter(reminder => reminder.status !== 'sent'));
      setUnreadCount(0);
    }
    return success;
  };

  // Set up subscription and initial fetch
  useReminderSubscription(handleFetchAndProcess);

  return {
    pendingReminders,
    unreadCount,
    loading,
    dismissReminder,
    dismissAll,
    refresh: handleFetchAndProcess,
    processReminders,
  };
};
