
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useCallback, useEffect, useMemo } from 'react';
import { Reminder, ReminderType, DeliveryMethod, ReminderStatus } from './reminders/types';

interface UnifiedReminderSystemOptions {
  enableRealtime?: boolean;
  enableNotifications?: boolean;
  limit?: number;
}

export const useUnifiedReminderSystem = (options: UnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enableRealtime = true, enableNotifications = true, limit = 1000 } = options;

  console.log('🔄 useUnifiedReminderSystem initialized with options:', options);

  // Fetch reminders with proper type transformation
  const {
    data: rawReminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['unified-reminders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('📡 Fetching reminders for user:', user.id);
      
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          events:event_id(*),
          goals:goal_id(*)
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .order('reminder_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching reminders:', error);
        throw error;
      }

      console.log('✅ Raw reminders fetched:', data?.length || 0);
      
      // Transform database response to proper Reminder type
      const transformedReminders: Reminder[] = (data || []).map(item => ({
        ...item,
        type: item.type as ReminderType,
        status: item.status as ReminderStatus,
        delivery_methods: Array.isArray(item.delivery_methods) 
          ? (item.delivery_methods as string[]).map(method => method as DeliveryMethod)
          : ['in_app' as DeliveryMethod]
      }));

      console.log('✅ Transformed reminders:', transformedReminders.length);
      return transformedReminders;
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Transform raw data to proper Reminder objects
  const reminders = useMemo(() => rawReminders, [rawReminders]);

  // Calculate counts
  const totalCount = reminders.length;
  const unreadCount = reminders.filter(r => r.status === 'sent').length;

  console.log('📊 Unified reminder counts - Total:', totalCount, 'Unread:', unreadCount);

  // Dismiss single reminder mutation
  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Dismissing reminder:', id);
      
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id || '');

      if (error) throw error;
      return id;
    },
    onMutate: async (id: string) => {
      // Optimistic update - immediately remove from UI
      await queryClient.cancelQueries({ queryKey: ['unified-reminders', user?.id] });
      
      const previousReminders = queryClient.getQueryData<Reminder[]>(['unified-reminders', user?.id]);
      
      queryClient.setQueryData<Reminder[]>(['unified-reminders', user?.id], old => 
        old?.filter(r => r.id !== id) || []
      );
      
      return { previousReminders };
    },
    onError: (err, id, context) => {
      console.error('❌ Failed to dismiss reminder:', err);
      // Rollback optimistic update
      if (context?.previousReminders) {
        queryClient.setQueryData(['unified-reminders', user?.id], context.previousReminders);
      }
      toast.error('Failed to dismiss reminder');
    },
    onSuccess: (id) => {
      console.log('✅ Reminder dismissed successfully:', id);
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['unified-reminders', user?.id] });
    },
  });

  // Batch dismiss mutation
  const batchDismissMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      console.log('🗑️ Batch dismissing reminders:', ids.length);
      
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .in('id', ids)
        .eq('user_id', user?.id || '');

      if (error) throw error;
      return ids;
    },
    onMutate: async (ids: string[]) => {
      // Optimistic update - immediately remove from UI
      await queryClient.cancelQueries({ queryKey: ['unified-reminders', user?.id] });
      
      const previousReminders = queryClient.getQueryData<Reminder[]>(['unified-reminders', user?.id]);
      
      queryClient.setQueryData<Reminder[]>(['unified-reminders', user?.id], old => 
        old?.filter(r => !ids.includes(r.id)) || []
      );
      
      return { previousReminders };
    },
    onError: (err, ids, context) => {
      console.error('❌ Failed to batch dismiss reminders:', err);
      // Rollback optimistic update
      if (context?.previousReminders) {
        queryClient.setQueryData(['unified-reminders', user?.id], context.previousReminders);
      }
      toast.error('Failed to dismiss reminders');
    },
    onSuccess: (ids) => {
      console.log('✅ Batch dismissed successfully:', ids.length);
      toast.success(`Dismissed ${ids.length} reminders`);
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['unified-reminders', user?.id] });
    },
  });

  // Dismiss all sent reminders
  const dismissAll = useCallback(() => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      console.log('🗑️ Dismissing all sent reminders:', sentReminderIds.length);
      batchDismissMutation.mutate(sentReminderIds);
    }
  }, [reminders, batchDismissMutation]);

  // Real-time subscription
  useEffect(() => {
    if (!user || !enableRealtime) return;
    
    console.log('🔄 Setting up realtime subscription for reminders');
    
    const channel = supabase
      .channel('reminder-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Realtime reminder change detected:', payload.eventType);
          
          // Safely access the payload data
          const reminderData = payload.new && typeof payload.new === 'object' && 'id' in payload.new 
            ? payload.new as { id: string }
            : null;
          
          if (reminderData) {
            console.log('🔄 Reminder ID:', reminderData.id);
          }
          
          // Debounced invalidation to prevent too many refetches
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['unified-reminders', user.id] });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, enableRealtime, queryClient]);

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
    refresh: refetch,
  };
};
