
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useEffect } from 'react';
import type { Reminder, DeliveryMethod } from './reminders/types';

interface UnifiedReminderSystemOptions {
  enableRealtime?: boolean;
  enableNotifications?: boolean;
  limit?: number;
}

export const useUnifiedReminderSystem = (options: UnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enableRealtime = true, enableNotifications = true, limit = 20 } = options;

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

  const reminders = queryData?.reminders || [];
  const totalCount = queryData?.totalCount || 0;
  const unreadCount = reminders.filter(r => r.status === 'sent').length;

  // Single dismiss mutation
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
    onSuccess: (id) => {
      console.log('✅ Reminder dismissed:', id);
      toast.success('Reminder dismissed');
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
    },
    onError: (error) => {
      console.error('❌ Failed to dismiss reminder:', error);
      toast.error('Failed to dismiss reminder');
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
    onSuccess: (ids) => {
      console.log('✅ Batch dismissed reminders:', ids.length);
      toast.success(`Dismissed ${ids.length} reminders`);
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
    },
    onError: (error) => {
      console.error('❌ Failed to batch dismiss reminders:', error);
      toast.error('Failed to dismiss reminders');
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

  // Set up realtime subscription
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
          queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
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
