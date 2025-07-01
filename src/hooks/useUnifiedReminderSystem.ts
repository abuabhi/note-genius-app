
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Reminder, ReminderStatus, ReminderType, ReminderRecurrence, DeliveryMethod } from './reminders/types';

// Helper function to transform raw database data to our Reminder type
const transformReminderData = (rawData: any[]): Reminder[] => {
  return rawData.map(item => ({
    ...item,
    type: item.type as ReminderType,
    status: item.status as ReminderStatus,
    recurrence: item.recurrence as ReminderRecurrence,
    delivery_methods: Array.isArray(item.delivery_methods) 
      ? item.delivery_methods as DeliveryMethod[]
      : ['in_app' as DeliveryMethod]
  }));
};

export const useUnifiedReminderSystem = (options?: {
  enableRealtime?: boolean;
  enableNotifications?: boolean;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enableRealtime = true, enableNotifications = true } = options || {};

  console.log('🚀 UnifiedReminderSystem: Single source of truth for all reminders');

  // Main reminders query with optimized caching
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['unified-reminders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('📡 UnifiedReminderSystem: Fetching reminders for user:', user.id);

      const { data, error } = await supabase
        .from('reminders')
        .select(`
          id,
          user_id,
          title,
          description,
          reminder_time,
          due_date,
          type,
          status,
          priority,
          escalation_level,
          delivery_methods,
          recurrence,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .order('reminder_time', { ascending: true })
        .limit(100); // Reasonable limit for UI performance

      if (error) {
        console.error('❌ UnifiedReminderSystem: Error fetching reminders:', error);
        throw error;
      }

      console.log('✅ UnifiedReminderSystem: Fetched reminders:', data?.length || 0);
      return transformReminderData(data || []);
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Get accurate total count
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['unified-reminders-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent']);

      if (error) {
        console.error('❌ UnifiedReminderSystem: Error counting reminders:', error);
        return 0;
      }

      console.log('📊 UnifiedReminderSystem: Total count:', count);
      return count || 0;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!user || !enableRealtime) return;

    console.log('🔄 UnifiedReminderSystem: Setting up realtime subscription');

    const channel = supabase
      .channel('unified-reminders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 UnifiedReminderSystem: Realtime update:', payload.eventType);
          
          // Smart cache invalidation
          queryClient.invalidateQueries({
            queryKey: ['unified-reminders', user.id],
            exact: false,
          });
          queryClient.invalidateQueries({
            queryKey: ['unified-reminders-count', user.id],
            exact: false,
          });
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 UnifiedReminderSystem: Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, enableRealtime, queryClient]);

  // Unified dismiss mutation
  const dismissMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      console.log('🗑️ UnifiedReminderSystem: Dismissing reminder:', reminderId);
      
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
    onMutate: async (reminderId) => {
      // Optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ['unified-reminders', user?.id] 
      });

      const previousReminders = queryClient.getQueryData(['unified-reminders', user?.id]);

      queryClient.setQueryData(
        ['unified-reminders', user?.id],
        (old: Reminder[] = []) => old.filter(r => r.id !== reminderId)
      );

      return { previousReminders };
    },
    onError: (err, reminderId, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(
          ['unified-reminders', user?.id],
          context.previousReminders
        );
      }
      console.error('❌ UnifiedReminderSystem: Failed to dismiss reminder:', err);
      toast.error('Failed to dismiss reminder');
    },
    onSuccess: (reminderId) => {
      console.log('✅ UnifiedReminderSystem: Reminder dismissed successfully:', reminderId);
      toast.success('Reminder dismissed');
      
      // Refresh counts
      queryClient.invalidateQueries({
        queryKey: ['unified-reminders-count', user?.id],
      });
    },
  });

  // Batch dismiss mutation
  const batchDismissMutation = useMutation({
    mutationFn: async (reminderIds: string[]) => {
      console.log('🗑️ UnifiedReminderSystem: Batch dismissing reminders:', reminderIds.length);
      
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .in('id', reminderIds)
        .eq('user_id', user?.id || '');

      if (error) throw error;
      return reminderIds;
    },
    onMutate: async (reminderIds) => {
      await queryClient.cancelQueries({ 
        queryKey: ['unified-reminders', user?.id] 
      });

      const previousReminders = queryClient.getQueryData(['unified-reminders', user?.id]);

      queryClient.setQueryData(
        ['unified-reminders', user?.id],
        (old: Reminder[] = []) => old.filter(r => !reminderIds.includes(r.id))
      );

      return { previousReminders };
    },
    onError: (err, reminderIds, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(
          ['unified-reminders', user?.id],
          context.previousReminders
        );
      }
      console.error('❌ UnifiedReminderSystem: Failed to batch dismiss reminders:', err);
      toast.error('Failed to dismiss reminders');
    },
    onSuccess: (reminderIds) => {
      console.log('✅ UnifiedReminderSystem: Batch dismissed reminders:', reminderIds.length);
      toast.success(`Dismissed ${reminderIds.length} reminders`);
      
      queryClient.invalidateQueries({
        queryKey: ['unified-reminders-count', user?.id],
      });
    },
  });

  const dismissReminder = useCallback((id: string) => {
    dismissMutation.mutate(id);
  }, [dismissMutation]);

  const batchDismissReminders = useCallback((ids: string[]) => {
    batchDismissMutation.mutate(ids);
  }, [batchDismissMutation]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['unified-reminders', user?.id] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['unified-reminders-count', user?.id] 
    });
  }, [queryClient, user?.id]);

  return {
    reminders,
    totalCount,
    unreadCount: reminders.filter(r => r.status === 'sent').length,
    isLoading,
    error,
    dismissReminder,
    batchDismissReminders,
    isDismissing: dismissMutation.isPending || batchDismissMutation.isPending,
    refresh,
  };
};
