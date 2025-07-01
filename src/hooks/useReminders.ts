
import { useUnifiedReminderSystem } from './useUnifiedReminderSystem';
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

// Updated useReminders hook using the unified system
export const useReminders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  console.log('🔄 useReminders: Using unified system internally');
  
  // Use the unified reminder system
  const {
    reminders,
    totalCount,
    isLoading,
    error,
    dismissReminder: unifiedDismiss,
    batchDismissReminders: unifiedBatchDismiss,
    isDismissing,
    refresh
  } = useUnifiedReminderSystem({
    enableRealtime: true,
    enableNotifications: true
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: any) => {
      console.log('📝 useReminders: Creating reminder via unified system:', reminderData);
      
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
      refresh();
    },
    onError: (error) => {
      console.error('❌ useReminders: Failed to create reminder:', error);
      toast.error('Failed to create reminder');
    },
  });

  // Cancel reminder mutation
  const cancelReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      console.log('❌ useReminders: Cancelling reminder via unified system:', reminderId);
      
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
      refresh();
    },
    onError: (error) => {
      console.error('❌ useReminders: Failed to cancel reminder:', error);
      toast.error('Failed to cancel reminder');
    },
  });

  // Backward-compatible dismiss mutation
  const dismissReminder = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ useReminders: Using unified dismiss for:', id);
      unifiedDismiss(id);
      return true;
    },
    onSuccess: () => {
      // Invalidation is handled by the unified system
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
    totalCount,
    isLoading,
    error,
    dismissReminder,
    isDismissing,
    createReminder: createReminderMutation,
    cancelReminder: cancelReminderMutation,
    formatReminderTime,
    
    // Additional methods for full compatibility
    refresh,
    batchDismiss: unifiedBatchDismiss,
  };
};

// Export the unified hook as well
export { useUnifiedReminderSystem };
