
import { useUnifiedReminderSystem } from '../useUnifiedReminderSystem';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Reminder, ReminderStatus } from './types';

// DEPRECATED: This hook is now a thin wrapper around useUnifiedReminderSystem
// All functionality has been moved to the unified system to prevent duplicates
export const useScalableReminders = (options?: {
  limit?: number;
  status?: ReminderStatus[];
  enableRealtime?: boolean;
}) => {
  const { user } = useAuth();
  const { limit = 1000, status = ['pending', 'sent'], enableRealtime = true } = options || {};

  console.warn('⚠️ useScalableReminders is deprecated. Use useUnifiedReminderSystem directly.');

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

  // Filter reminders based on status
  const filteredReminders = allReminders.filter(r => status.includes(r.status as ReminderStatus));

  // Track which reminders are being dismissed
  const isReminderDismissing = (id: string) => isDismissing;

  // Has more logic for pagination compatibility (always false now since we load all)
  const hasMore = false;

  const loadMore = () => {
    console.log('📄 LoadMore called - unified system loads all reminders automatically');
  };

  // Wrapper functions to maintain API compatibility
  const dismissReminder = (id: string) => {
    console.log('🗑️ ScalableReminders dismissing via unified system:', id);
    unifiedDismiss(id);
  };

  const batchDismissReminders = (ids: string[]) => {
    console.log('🗑️ ScalableReminders batch dismissing via unified system:', ids.length);
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
    isReminderDismissing,
    hasMore,
    loadMore,
  };
};
