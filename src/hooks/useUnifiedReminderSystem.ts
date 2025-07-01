
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Reminder, ReminderType, ReminderStatus } from './reminders/types';

export interface UnifiedReminderSystemOptions {
  enableRealtime?: boolean;
  enableNotifications?: boolean;
  limit?: number;
  status?: ('pending' | 'sent' | 'cancelled' | 'failed')[];
}

export const useUnifiedReminderSystem = (options: UnifiedReminderSystemOptions = {}) => {
  const { 
    enableRealtime = true, 
    enableNotifications = true,
    limit = 50,
    status = ['pending', 'sent']
  } = options;
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  console.log('🚀 UnifiedReminderSystem: Initializing with options:', options);

  // Core reminders query - single source of truth
  const { 
    data: reminders = [], 
    isLoading, 
    error, 
    refetch: refresh 
  } = useQuery({
    queryKey: ['unified-reminders', user?.id, { limit, status }],
    queryFn: async (): Promise<Reminder[]> => {
      if (!user?.id) return [];
      
      console.log('📊 UnifiedReminderSystem: Fetching reminders for user:', user.id);
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', status)
        .order('reminder_time', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ UnifiedReminderSystem: Query error:', error);
        throw error;
      }

      console.log('✅ UnifiedReminderSystem: Fetched reminders:', data?.length || 0);
      
      // Transform database response to match Reminder type
      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.type as ReminderType,
        status: item.status as ReminderStatus,
        delivery_methods: Array.isArray(item.delivery_methods) 
          ? item.delivery_methods as string[]
          : (item.delivery_methods as any)?.length ? item.delivery_methods as string[] : ['in_app']
      })) as Reminder[];

      return transformedData;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
    refetchInterval: enableRealtime ? 60000 : false, // 1 minute if realtime enabled
  });

  // Dismiss single reminder mutation
  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ UnifiedReminderSystem: Dismissing reminder:', id);
      
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
    onSuccess: () => {
      console.log('✅ UnifiedReminderSystem: Reminder dismissed successfully');
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
    },
    onError: (error) => {
      console.error('❌ UnifiedReminderSystem: Failed to dismiss reminder:', error);
      toast.error('Failed to dismiss reminder');
    },
  });

  // Batch dismiss reminders mutation
  const batchDismissMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      console.log('🗑️ UnifiedReminderSystem: Batch dismissing reminders:', ids.length);
      
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
      console.log('✅ UnifiedReminderSystem: Batch dismissed reminders:', ids.length);
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
    },
    onError: (error) => {
      console.error('❌ UnifiedReminderSystem: Failed to batch dismiss reminders:', error);
      toast.error('Failed to dismiss reminders');
    },
  });

  // Realtime subscription for live updates
  useEffect(() => {
    if (!enableRealtime || !user?.id) return;

    console.log('🔄 UnifiedReminderSystem: Setting up realtime subscription');
    
    const channel = supabase
      .channel(`reminders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 UnifiedReminderSystem: Realtime update:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 UnifiedReminderSystem: Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, enableRealtime, queryClient]);

  // Browser notifications for due reminders
  useEffect(() => {
    if (!enableNotifications || !reminders.length) return;

    const now = new Date();
    const dueReminders = reminders.filter(reminder => {
      if (reminder.status !== 'pending') return false;
      
      const reminderTime = reminder.reminder_time ? new Date(reminder.reminder_time) : null;
      const dueDate = reminder.due_date ? new Date(reminder.due_date) : null;
      
      const isReminderDue = reminderTime && reminderTime <= now;
      const isDueDatePassed = dueDate && dueDate <= now;
      
      return isReminderDue || isDueDatePassed;
    });

    if (dueReminders.length > 0 && Notification.permission === 'granted') {
      dueReminders.slice(0, 3).forEach(reminder => { // Limit to 3 notifications
        new Notification(reminder.title, {
          body: reminder.description || 'You have a reminder due',
          icon: '/favicon.ico',
          tag: `reminder-${reminder.id}`,
        });
      });
    }
  }, [reminders, enableNotifications]);

  // Request notification permission
  useEffect(() => {
    if (enableNotifications && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [enableNotifications]);

  // Calculate counts
  const totalCount = reminders.length;
  const unreadCount = reminders.filter(r => r.status === 'sent').length;

  // Dismiss all method (for backward compatibility)
  const dismissAll = useCallback(async () => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      console.log('🗑️ UnifiedReminderSystem: Dismissing all sent reminders:', sentReminderIds.length);
      batchDismissMutation.mutate(sentReminderIds);
    }
  }, [reminders, batchDismissMutation]);

  console.log('📊 UnifiedReminderSystem: Current state:', {
    totalCount,
    unreadCount,
    isLoading,
    isDismissing: dismissMutation.isPending || batchDismissMutation.isPending
  });

  return {
    reminders,
    totalCount,
    unreadCount,
    isLoading,
    error: error as Error | null,
    dismissReminder: dismissMutation.mutate,
    batchDismissReminders: batchDismissMutation.mutate,
    dismissAll,
    isDismissing: dismissMutation.isPending || batchDismissMutation.isPending,
    refresh,
  };
};
