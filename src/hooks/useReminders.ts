
import { useOptimizedReminders } from './reminders/useOptimizedReminders';
import { useOptimizedReminderNotifications } from './reminders/useOptimizedReminderNotifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Re-export all types for backward compatibility
export type { 
  Reminder, 
  ReminderStatus, 
  ReminderRecurrence, 
  DeliveryMethod, 
  ReminderType,
  CreateReminderData,
  ReminderFormValues
} from './reminders/types';

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

  // Create reminder mutation for backward compatibility
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: any) => {
      console.log('📝 Creating reminder:', reminderData);
      
      const { error, data } = await supabase
        .from('reminders')
        .insert({
          ...reminderData,
          user_id: user?.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Reminder created successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['optimized-reminders', user?.id] 
      });
    },
    onError: (error) => {
      console.error('❌ Failed to create reminder:', error);
      toast.error('Failed to create reminder');
    },
  });

  // Cancel reminder mutation for backward compatibility
  const cancelReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      console.log('❌ Cancelling reminder:', reminderId);
      
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user?.id || '');

      if (error) throw error;
      return reminderId;
    },
    onSuccess: () => {
      toast.success('Reminder cancelled');
      queryClient.invalidateQueries({ 
        queryKey: ['optimized-reminders', user?.id] 
      });
    },
    onError: (error) => {
      console.error('❌ Failed to cancel reminder:', error);
      toast.error('Failed to cancel reminder');
    },
  });

  // Backward-compatible dismiss mutation
  const dismissReminder = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Using backward-compatible dismiss for:', id);
      optimizedDismiss(id);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  // Format reminder time helper
  const formatReminderTime = (reminderTime: string) => {
    try {
      return formatDistanceToNow(new Date(reminderTime), { addSuffix: true });
    } catch {
      return 'Soon';
    }
  };

  return {
    reminders,
    isLoading,
    error,
    dismissReminder,
    isDismissing,
    createReminder: createReminderMutation,
    cancelReminder: cancelReminderMutation,
    formatReminderTime,
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
