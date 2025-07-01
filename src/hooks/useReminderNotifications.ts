
import { useUnifiedReminderSystem } from './useUnifiedReminderSystem';

// Backward-compatible wrapper that uses the unified notification system
export const useReminderNotifications = () => {
  const {
    reminders,
    unreadCount,
    totalCount,
    isLoading,
    dismissReminder,
    dismissAll,
    refresh
  } = useUnifiedReminderSystem({
    enableRealtime: true,
    enableNotifications: true
  });

  return {
    pendingReminders: reminders, // Backward compatibility
    unreadCount,
    totalCount, // Now accurate count
    loading: isLoading,
    dismissReminder: async (id: string) => {
      dismissReminder(id);
      return true; // Backward compatibility
    },
    dismissAll: async () => {
      await dismissAll();
      return true; // Backward compatibility
    },
    refresh,
    processReminders: () => {}, // No-op for backward compatibility
  };
};
