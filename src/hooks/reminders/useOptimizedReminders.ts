
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Reminder, ReminderStatus, ReminderType, ReminderRecurrence, DeliveryMethod } from './types';

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

// Optimized reminder hook with aggressive caching and performance optimizations
export const useOptimizedReminders = (options?: {
  limit?: number;
  status?: ReminderStatus[];
  enableRealtime?: boolean;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { limit = 20, status = ['pending', 'sent'], enableRealtime = true } = options || {};

  // Optimized query with aggressive caching
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['optimized-reminders', user?.id, { limit, status }],
    queryFn: async () => {
      if (!user) return [];

      console.log('🚀 Fetching optimized reminders with indexes');

      // Optimized query using our new indexes
      let query = supabase
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
        .in('status', status)
        .order('reminder_time', { ascending: true })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching optimized reminders:', error);
        throw error;
      }

      console.log('✅ Fetched optimized reminders:', data?.length || 0);
      
      // Transform the raw data to match our TypeScript types
      return transformReminderData(data || []);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - aggressive caching
    gcTime: 10 * 60 * 1000, // 10 minutes cache retention
    refetchOnWindowFocus: false, // Reduce unnecessary requests
    refetchOnMount: false, // Use cache on mount
    refetchInterval: false, // No polling, use realtime instead
  });

  // Set up realtime subscription for instant updates
  useEffect(() => {
    if (!user || !enableRealtime) return;

    console.log('🔄 Setting up optimized realtime subscription');

    const channel = supabase
      .channel('reminders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Realtime reminder update:', payload.eventType);
          
          // Smart cache invalidation - only invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: ['optimized-reminders', user.id],
            exact: false,
          });
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, enableRealtime, queryClient]);

  // Optimized dismiss mutation with optimistic updates
  const dismissMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      console.log('🗑️ Dismissing reminder optimistically:', reminderId);
      
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
      await queryClient.cancelQueries({ 
        queryKey: ['optimized-reminders', user?.id] 
      });

      const previousReminders = queryClient.getQueryData(['optimized-reminders', user?.id]);

      queryClient.setQueryData(
        ['optimized-reminders', user?.id, { limit, status }],
        (old: Reminder[] = []) => old.filter(r => r.id !== reminderId)
      );

      return { previousReminders };
    },
    onError: (err, reminderId, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(
          ['optimized-reminders', user?.id, { limit, status }],
          context.previousReminders
        );
      }
      console.error('❌ Failed to dismiss reminder:', err);
      toast.error('Failed to dismiss reminder');
    },
    onSuccess: (reminderId) => {
      console.log('✅ Reminder dismissed successfully:', reminderId);
      toast.success('Reminder dismissed');
      
      queryClient.invalidateQueries({
        queryKey: ['optimized-reminders', user?.id],
        exact: false,
      });
    },
  });

  // Batch dismiss mutation for multiple reminders
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

      if (error) throw error;
      return reminderIds;
    },
    onMutate: async (reminderIds) => {
      await queryClient.cancelQueries({ 
        queryKey: ['optimized-reminders', user?.id] 
      });

      const previousReminders = queryClient.getQueryData(['optimized-reminders', user?.id]);

      queryClient.setQueryData(
        ['optimized-reminders', user?.id, { limit, status }],
        (old: Reminder[] = []) => old.filter(r => !reminderIds.includes(r.id))
      );

      return { previousReminders };
    },
    onError: (err, reminderIds, context) => {
      if (context?.previousReminders) {
        queryClient.setQueryData(
          ['optimized-reminders', user?.id, { limit, status }],
          context.previousReminders
        );
      }
      console.error('❌ Failed to batch dismiss reminders:', err);
      toast.error('Failed to dismiss reminders');
    },
    onSuccess: (reminderIds) => {
      console.log('✅ Batch dismissed reminders:', reminderIds.length);
      toast.success(`Dismissed ${reminderIds.length} reminders`);
      
      queryClient.invalidateQueries({
        queryKey: ['optimized-reminders', user?.id],
        exact: false,
      });
    },
  });

  return {
    reminders,
    isLoading,
    error,
    refetch,
    dismissReminder: dismissMutation.mutate,
    batchDismissReminders: batchDismissMutation.mutate,
    isDismissing: dismissMutation.isPending,
    isBatchDismissing: batchDismissMutation.isPending,
  };
};
