
import { useUnifiedReminderSystem } from '../useUnifiedReminderSystem';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Reminder, ReminderStatus, ReminderType, ReminderRecurrence, DeliveryMethod } from './types';

// Optimized reminder hook using unified system internally
export const useOptimizedReminders = (options?: {
  limit?: number;
  status?: ReminderStatus[];
  enableRealtime?: boolean;
}) => {
  const { user } = useAuth();
  const { limit = 20, status = ['pending', 'sent'], enableRealtime = true } = options || {};

  console.log('🚀 OptimizedReminders now using unified system internally');

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
    enableNotifications: true
  });

  // Filter and limit reminders to maintain compatibility
  const filteredReminders = allReminders
    .filter(r => status.includes(r.status as ReminderStatus))
    .slice(0, limit);

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
