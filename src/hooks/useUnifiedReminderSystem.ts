
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useCallback } from 'react';

// Simple types that match database reality
interface SimpleReminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  due_date?: string | null;
  type: string;
  status: string;
  recurrence: string;
  delivery_methods: string[];
  priority: string;
  created_at: string;
  updated_at: string;
  events?: { id: string; title: string } | null;
  goals?: { id: string; title: string } | null;
}

interface UnifiedReminderSystemOptions {
  enableRealtime?: boolean;
  enableNotifications?: boolean;
  limit?: number;
  status?: string[];
}

export const useUnifiedReminderSystem = (options: UnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    limit = 50,
    status = ['pending', 'sent'] 
  } = options;

  console.log('🔄 useUnifiedReminderSystem initialized');

  // Simple query without problematic options
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch: refresh
  } = useQuery({
    queryKey: ['unified-reminders', user?.id, status],
    queryFn: async (): Promise<SimpleReminder[]> => {
      if (!user?.id) {
        return [];
      }

      console.log('🔔 Fetching reminders for user:', user.id);
      
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          events!reminders_event_id_fkey(id, title),
          goals!reminders_goal_id_fkey(id, title)
        `)
        .eq('user_id', user.id)
        .in('status', status)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Failed to fetch reminders:', error);
        throw error;
      }

      console.log('✅ Fetched reminders:', data?.length || 0);
      
      // Transform the data to match our SimpleReminder interface
      const transformedData: SimpleReminder[] = (data || []).map(item => ({
        ...item,
        delivery_methods: Array.isArray(item.delivery_methods) 
          ? item.delivery_methods as string[]
          : ['in_app'] // Default fallback
      }));
      
      return transformedData;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Computed values
  const totalCount = reminders.length;
  const unreadCount = reminders.filter(r => r.status === 'sent').length;

  // Dismiss single reminder with optimistic update
  const dismissMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      console.log('🗑️ Dismissing reminder:', reminderId);
      
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user?.id || '');

      if (error) {
        console.error('❌ Failed to dismiss reminder:', error);
        throw error;
      }

      return reminderId;
    },
    onMutate: async (reminderId: string) => {
      // Optimistic update - remove from list immediately
      await queryClient.cancelQueries({ queryKey: ['unified-reminders', user?.id, status] });
      
      const previousReminders = queryClient.getQueryData<SimpleReminder[]>(['unified-reminders', user?.id, status]);
      
      if (previousReminders) {
        queryClient.setQueryData(
          ['unified-reminders', user?.id, status], 
          previousReminders.filter(r => r.id !== reminderId)
        );
      }
      
      return { previousReminders };
    },
    onError: (error, reminderId, context) => {
      console.error('❌ Failed to dismiss reminder:', error);
      // Revert optimistic update
      if (context?.previousReminders) {
        queryClient.setQueryData(['unified-reminders', user?.id, status], context.previousReminders);
      }
      toast.error('Failed to dismiss reminder');
    },
    onSuccess: () => {
      console.log('✅ Reminder dismissed successfully');
      toast.success('Reminder dismissed');
    }
  });

  // Batch dismiss with optimistic update
  const batchDismissMutation = useMutation({
    mutationFn: async (reminderIds: string[]) => {
      console.log('🗑️ Batch dismissing reminders:', reminderIds.length);
      
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .in('id', reminderIds)
        .eq('user_id', user?.id || '');

      if (error) {
        console.error('❌ Failed to batch dismiss reminders:', error);
        throw error;
      }

      return reminderIds;
    },
    onMutate: async (reminderIds: string[]) => {
      // Optimistic update - remove all from list immediately
      await queryClient.cancelQueries({ queryKey: ['unified-reminders', user?.id, status] });
      
      const previousReminders = queryClient.getQueryData<SimpleReminder[]>(['unified-reminders', user?.id, status]);
      
      if (previousReminders) {
        queryClient.setQueryData(
          ['unified-reminders', user?.id, status], 
          previousReminders.filter(r => !reminderIds.includes(r.id))
        );
      }
      
      return { previousReminders };
    },
    onError: (error, reminderIds, context) => {
      console.error('❌ Failed to batch dismiss reminders:', error);
      // Revert optimistic update
      if (context?.previousReminders) {
        queryClient.setQueryData(['unified-reminders', user?.id, status], context.previousReminders);
      }
      toast.error('Failed to dismiss reminders');
    },
    onSuccess: (reminderIds) => {
      console.log('✅ Batch dismissed reminders:', reminderIds.length);
      toast.success(`Dismissed ${reminderIds.length} reminders`);
    }
  });

  // Simple dismiss all function
  const dismissAll = useCallback(() => {
    const sentReminders = reminders.filter(r => r.status === 'sent');
    if (sentReminders.length > 0) {
      const reminderIds = sentReminders.map(r => r.id);
      batchDismissMutation.mutate(reminderIds);
    }
  }, [reminders, batchDismissMutation]);

  return {
    reminders,
    totalCount,
    unreadCount,
    isLoading,
    error,
    dismissReminder: dismissMutation.mutate,
    batchDismissReminders: batchDismissMutation.mutate,
    dismissAll,
    isDismissing: dismissMutation.isPending || batchDismissMutation.isPending,
    refresh,
  };
};
