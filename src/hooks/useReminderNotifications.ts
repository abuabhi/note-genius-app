
import { useOptimizedReminderNotifications } from './reminders/useOptimizedReminderNotifications';

// Backward-compatible wrapper that uses the optimized notification system
export const useReminderNotifications = () => {
  const {
    reminders,
    unreadCount,
    isLoading,
    dismissReminder,
    dismissAll,
    refresh
  } = useOptimizedReminderNotifications();

  return {
    pendingReminders: reminders, // Backward compatibility
    unreadCount,
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
