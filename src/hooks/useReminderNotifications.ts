
import { useUnifiedReminderSystem } from './useUnifiedReminderSystem';

// DEPRECATED: This hook is now a thin wrapper around useUnifiedReminderSystem
// All functionality has been moved to the unified system to prevent duplicates
export const useReminderNotifications = () => {
  console.warn('⚠️ useReminderNotifications is deprecated. Use useUnifiedReminderSystem directly.');
  
  const {
    reminders,
    unreadCount,
    totalCount,
    isLoading,
    dismissReminder: unifiedDismiss,
    batchDismissReminders: unifiedBatchDismiss,
    refresh
  } = useUnifiedReminderSystem({
    enableRealtime: true,
    enableNotifications: true,
    limit: 1000
  });

  const dismissAll = async () => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      console.log('🗑️ useReminderNotifications: Dismissing all via unified system:', sentReminderIds.length);
      unifiedBatchDismiss(sentReminderIds);
    }
    return true; // Backward compatibility
  };

  return {
    pendingReminders: reminders, // Backward compatibility
    unreadCount,
    totalCount,
    loading: isLoading,
    dismissReminder: async (id: string) => {
      console.log('🗑️ useReminderNotifications: Dismissing via unified system:', id);
      unifiedDismiss(id);
      return true; // Backward compatibility
    },
    dismissAll,
    refresh,
    processReminders: () => {}, // No-op for backward compatibility
  };
};
