
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import type { Reminder, DeliveryMethod } from './reminders/types';

interface UnifiedReminderSystemOptions {
  enableRealtime?: boolean;
  enableNotifications?: boolean;
  limit?: number;
}

export const useUnifiedReminderSystem = (options: UnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enableRealtime = true, enableNotifications = true, limit = 1000 } = options;
  const [optimisticDismissals, setOptimisticDismissals] = useState<Set<string>>(new Set());

  // Main query for reminders
  const {
    data: queryData,
    isLoading,
    error,
    refetch: refresh
  } = useQuery({
    queryKey: ['unified-reminders', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🔄 Fetching unified reminders for user:', user.id);

      const { data, error, count } = await supabase
        .from('reminders')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .order('reminder_time', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching reminders:', error);
        throw error;
      }

      console.log('✅ Fetched reminders:', data?.length || 0, 'Total count:', count);

      // Transform the data to ensure proper typing
      const transformedData = (data || []).map(item => ({
        ...item,
        delivery_methods: Array.isArray(item.delivery_methods) 
          ? item.delivery_methods as DeliveryMethod[]
          : (item.delivery_methods as unknown as DeliveryMethod[] || ['in_app'])
      }));

      return {
        reminders: transformedData as Reminder[],
        totalCount: count || 0
      };
    },
    enabled: !!user?.id,
  });

  // Filter out optimistically dismissed reminders
  const filteredReminders = (queryData?.reminders || []).filter(r => !optimisticDismissals.has(r.id));
  const reminders = filteredReminders;
  const totalCount = (queryData?.totalCount || 0) - optimisticDismissals.size;
  const unreadCount = reminders.filter(r => r.status === 'sent').length;

  // Single dismiss mutation using batch function for consistency
  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Dismissing reminder via batch function:', id);
      
      // Use batch dismiss function even for single dismissal
      const { data, error } = await supabase.rpc('batch_dismiss_reminders', {
        p_user_id: user?.id || '',
        p_reminder_ids: [id]
      });

      if (error) throw error;
      return data;
    },
    onMutate: async (id: string) => {
      // Optimistic update: immediately hide the reminder
      setOptimisticDismissals(prev => new Set(prev).add(id));
    },
    onSuccess: (data, id) => {
      console.log('✅ Reminder dismissed:', id);
      toast.success('Reminder dismissed');
      // Clear from optimistic dismissals and invalidate
      setOptimisticDismissals(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
    },
    onError: (error, id) => {
      console.error('❌ Failed to dismiss reminder:', error);
      toast.error('Failed to dismiss reminder');
      // Revert optimistic update
      setOptimisticDismissals(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    },
  });

  // Batch dismiss mutation using proper database function
  const batchDismissMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      console.log('🗑️ Batch dismissing reminders via database function:', ids.length);
      
      const { data, error } = await supabase.rpc('batch_dismiss_reminders', {
        p_user_id: user?.id || '',
        p_reminder_ids: ids
      });

      if (error) throw error;
      return data;
    },
    onMutate: async (ids: string[]) => {
      // Optimistic update: immediately hide all reminders
      setOptimisticDismissals(prev => {
        const newSet = new Set(prev);
        ids.forEach(id => newSet.add(id));
        return newSet;
      });
    },
    onSuccess: (data, ids) => {
      console.log('✅ Batch dismissed reminders:', ids.length);
      toast.success(`Dismissed ${ids.length} reminders`);
      // Clear from optimistic dismissals and invalidate
      setOptimisticDismissals(prev => {
        const newSet = new Set(prev);
        ids.forEach(id => newSet.delete(id));
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
    },
    onError: (error, ids) => {
      console.error('❌ Failed to batch dismiss reminders:', error);
      toast.error('Failed to dismiss reminders');
      // Revert optimistic updates
      setOptimisticDismissals(prev => {
        const newSet = new Set(prev);
        ids.forEach(id => newSet.delete(id));
        return newSet;
      });
    },
  });

  // Dismiss all sent reminders
  const dismissAll = () => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      console.log('🗑️ Dismissing all sent reminders:', sentReminderIds.length);
      batchDismissMutation.mutate(sentReminderIds);
    }
  };

  // Set up realtime subscription with smart filtering
  useEffect(() => {
    if (!enableRealtime || !user?.id) return;

    console.log('🔔 Setting up realtime subscription for reminders');

    const channel = supabase
      .channel('unified-reminders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Realtime reminder update:', payload);
          
          // Smart filtering: Don't invalidate if it's a cancelled reminder
          // This prevents dismissed reminders from reappearing
          if (payload.eventType === 'UPDATE' && payload.new?.status === 'cancelled') {
            console.log('🚫 Ignoring cancelled reminder update to prevent reappearing');
            return;
          }
          
          // Debounce invalidations to prevent rapid-fire updates
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
          }, 500);
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, enableRealtime, queryClient]);

  // Browser notifications for new reminders
  useEffect(() => {
    if (!enableNotifications || !user?.id) return;

    const newSentReminders = reminders.filter(r => r.status === 'sent');
    
    if (newSentReminders.length > 0 && Notification.permission === 'granted') {
      // Only show notification for the most recent one to avoid spam
      const latest = newSentReminders[0];
      console.log('🔔 Showing browser notification for reminder:', latest.title);
      
      new Notification(latest.title, {
        body: latest.description || 'You have a reminder',
        icon: '/favicon.ico',
        tag: latest.id,
      });
    }
  }, [reminders, enableNotifications, user?.id]);

  return {
    // Data
    reminders,
    totalCount,
    unreadCount,
    
    // Loading states
    isLoading,
    error,
    isDismissing: dismissMutation.isPending || batchDismissMutation.isPending,
    
    // Actions
    dismissReminder: dismissMutation.mutate,
    batchDismissReminders: batchDismissMutation.mutate,
    dismissAll,
    refresh,
  };
};
