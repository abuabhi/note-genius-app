
import { useUnifiedReminderSystem } from '../useUnifiedReminderSystem';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Reminder, ReminderStatus } from './types';

// Consolidated scalable reminder hook using unified system internally
export const useScalableReminders = (options?: {
  limit?: number;
  status?: ReminderStatus[];
  enableRealtime?: boolean;
}) => {
  const { user } = useAuth();
  const { limit = 20, status = ['pending', 'sent'], enableRealtime = true } = options || {};

  console.log('🔄 ScalableReminders now using unified system internally');

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

  // Filter reminders based on status and apply limit
  const filteredReminders = allReminders
    .filter(r => status.includes(r.status as ReminderStatus))
    .slice(0, limit);

  // Track which reminders are being dismissed
  const isReminderDismissing = (id: string) => isDismissing;

  // Has more logic for pagination compatibility
  const hasMore = totalCount > filteredReminders.length;

  const loadMore = () => {
    // For now, just log - the unified system handles pagination differently
    console.log('📄 LoadMore called - unified system handles this automatically');
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
