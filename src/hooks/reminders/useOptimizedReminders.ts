
import { useUnifiedReminderSystem } from '../useUnifiedReminderSystem';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Reminder, ReminderStatus, ReminderType, ReminderRecurrence, DeliveryMethod } from './types';

// DEPRECATED: This hook is now a thin wrapper around useUnifiedReminderSystem
// All functionality has been moved to the unified system to prevent duplicates
export const useOptimizedReminders = (options?: {
  limit?: number;
  status?: ReminderStatus[];
  enableRealtime?: boolean;
}) => {
  const { user } = useAuth();
  const { limit = 1000, status = ['pending', 'sent'], enableRealtime = true } = options || {};

  console.warn('⚠️ useOptimizedReminders is deprecated. Use useUnifiedReminderSystem directly.');

  // Use the unified system internally
  const {
    reminders: allReminders,
    totalCount,
    isLoading,
    error,
    dismissReminder: unifiedDismiss,
    batchDismissReminders: unifiedBatchDismiss,
    isDismissing,
    refresh
  } = useUnifiedReminderSystem({
    enableRealtime,
    enableNotifications: true,
    limit: 1000 // Always get all reminders
  });

  // Filter reminders to maintain compatibility
  const filteredReminders = allReminders.filter(r => status.includes(r.status as ReminderStatus));

  // Wrapper functions to maintain exact API compatibility
  const dismissReminder = (id: string) => {
    console.log('🗑️ OptimizedReminders dismissing via unified system:', id);
    unifiedDismiss(id);
  };

  const batchDismissReminders = (ids: string[]) => {
    console.log('🗑️ OptimizedReminders batch dismissing via unified system:', ids.length);
    unifiedBatchDismiss(ids);
  };

  return {
    reminders: filteredReminders,
    isLoading,
    error,
    refetch: refresh,
    dismissReminder,
    batchDismissReminders,
    isDismissing,
    isBatchDismissing: isDismissing,
  };
};
