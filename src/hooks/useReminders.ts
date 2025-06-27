
import { useOptimizedReminders } from './reminders/useOptimizedReminders';
import { useOptimizedReminderNotifications } from './reminders/useOptimizedReminderNotifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

// Backward-compatible wrapper that uses the optimized system
export const useReminders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Use the optimized reminders system
  const {
    reminders,
    isLoading,
    error,
    dismissReminder: optimizedDismiss,
    batchDismissReminders,
    isDismissing
  } = useOptimizedReminders({
    limit: 50,
    status: ['pending', 'sent'],
    enableRealtime: true,
  });

  // Backward-compatible dismiss mutation
  const dismissReminder = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Using backward-compatible dismiss for:', id);
      optimizedDismiss(id);
      return true;
    },
    onSuccess: () => {
      // Additional backward compatibility
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  return {
    reminders,
    isLoading,
    error,
    dismissReminder,
    isDismissing,
    // Additional methods for full compatibility
    refresh: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['optimized-reminders', user?.id] 
      });
    },
    batchDismiss: batchDismissReminders,
  };
};

// Export the optimized hooks as well
export { useOptimizedReminders, useOptimizedReminderNotifications };
