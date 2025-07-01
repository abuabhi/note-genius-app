
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Reminder, ReminderStatus } from './reminders/types';

interface UnifiedReminderSystemOptions {
  enableRealtime?: boolean;
  enableNotifications?: boolean;
}

export const useUnifiedReminderSystem = (options: UnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enableRealtime = true, enableNotifications = true } = options;
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNotified, setHasNotified] = useState(new Set<string>());
  const dismissingIds = useRef(new Set<string>());
  const realtimeChannelRef = useRef<any>(null);

  // Single source of truth for all reminders
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['unified-reminders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('🚀 Fetching unified reminders');

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
        .limit(100); // Increased limit to handle more reminders

      if (error) {
        console.error('❌ Error fetching unified reminders:', error);
        throw error;
      }

      console.log('✅ Fetched unified reminders:', data?.length || 0);
      return data as Reminder[];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Separate query for accurate count (not limited by pagination)
  const {
    data: totalCount = 0,
  } = useQuery({
    queryKey: ['unified-reminders-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      console.log('📊 Fetching reminder count');

      const { count, error } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent']);

      if (error) {
        console.error('❌ Error fetching reminder count:', error);
        return 0;
      }

      console.log('✅ Total reminder count:', count || 0);
      return count || 0;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Set up single realtime subscription
  useEffect(() => {
    if (!user || !enableRealtime) return;

    console.log('🔄 Setting up unified realtime subscription');

    // Clean up existing channel if any
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`unified-reminders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Unified realtime reminder update:', payload.eventType, payload.new?.id);
          
          // Invalidate both queries
          queryClient.invalidateQueries({
            queryKey: ['unified-reminders', user.id],
          });
          queryClient.invalidateQueries({
            queryKey: ['unified-reminders-count', user.id],
          });
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      console.log('🔌 Cleaning up unified realtime subscription');
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [user?.id, enableRealtime, queryClient]);

  // Process notifications
  useEffect(() => {
    if (!enableNotifications || !reminders.length) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const dueReminders = reminders.filter(reminder => {
      if (hasNotified.has(reminder.id)) return false;
      
      const reminderTimeDue = reminder.reminder_time && new Date(reminder.reminder_time) <= now;
      const dueDateDue = reminder.type === 'todo' && reminder.due_date && reminder.due_date <= today;
      
      return (reminderTimeDue || dueDateDue) && reminder.status === 'pending';
    });

    console.log('⏰ Processing due reminders for notifications:', dueReminders.length);

    dueReminders.forEach(reminder => {
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(reminder.title, {
          body: reminder.description || 'You have a reminder due',
          icon: '/favicon.ico',
          tag: reminder.id,
        });
      }
      
      setHasNotified(prev => new Set(prev).add(reminder.id));
    });

    // Update unread count based on 'sent' status reminders
    const sentCount = reminders.filter(r => r.status === 'sent').length;
    setUnreadCount(sentCount);
  }, [reminders, hasNotified, enableNotifications]);

  // Request notification permission
  useEffect(() => {
    if (!enableNotifications || !user) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, [user, enableNotifications]);

  // Enhanced dismiss mutation with better error handling
  const dismissMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🗑️ Dismissing reminder:', reminderId);
      dismissingIds.current.add(reminderId);

      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled' as ReminderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Database error dismissing reminder:', error);
        throw error;
      }

      return reminderId;
    },
    onMutate: async (reminderId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['unified-reminders', user?.id] 
      });
      await queryClient.cancelQueries({ 
        queryKey: ['unified-reminders-count', user?.id] 
      });

      // Optimistic updates
      queryClient.setQueryData(
        ['unified-reminders', user?.id],
        (old: Reminder[] | undefined) => {
          if (!old) return old;
          return old.filter(r => r.id !== reminderId);
        }
      );

      // Update count optimistically
      queryClient.setQueryData(
        ['unified-reminders-count', user?.id],
        (old: number | undefined) => Math.max(0, (old || 0) - 1)
      );

      return { reminderId };
    },
    onError: (error, reminderId, context) => {
      console.error('❌ Failed to dismiss reminder:', error);
      dismissingIds.current.delete(reminderId);
      
      // Rollback optimistic updates
      queryClient.invalidateQueries({
        queryKey: ['unified-reminders', user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['unified-reminders-count', user?.id],
      });
      
      toast.error('Failed to dismiss reminder. Please try again.');
    },
    onSuccess: (reminderId) => {
      console.log('✅ Reminder dismissed successfully:', reminderId);
      dismissingIds.current.delete(reminderId);
      
      // Clean up notification state
      setHasNotified(prev => {
        const newSet = new Set(prev);
        newSet.delete(reminderId);
        return newSet;
      });
      
      toast.success('Reminder dismissed');
      
      // Force refresh to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['unified-reminders', user?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['unified-reminders-count', user?.id],
        });
      }, 100);
    },
  });

  // Enhanced batch dismiss mutation
  const batchDismissMutation = useMutation({
    mutationFn: async (reminderIds: string[]) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🗑️ Batch dismissing reminders:', reminderIds.length);
      reminderIds.forEach(id => dismissingIds.current.add(id));

      const { data, error } = await supabase.rpc('batch_dismiss_reminders', {
        p_user_id: user.id,
        p_reminder_ids: reminderIds
      });

      if (error) {
        console.error('❌ Database error batch dismissing:', error);
        throw error;
      }

      return data?.[0] || { dismissed_count: reminderIds.length, failed_ids: [] };
    },
    onMutate: async (reminderIds) => {
      await queryClient.cancelQueries({ 
        queryKey: ['unified-reminders', user?.id] 
      });
      await queryClient.cancelQueries({ 
        queryKey: ['unified-reminders-count', user?.id] 
      });

      // Optimistic batch update
      queryClient.setQueryData(
        ['unified-reminders', user?.id],
        (old: Reminder[] | undefined) => {
          if (!old) return old;
          return old.filter(r => !reminderIds.includes(r.id));
        }
      );

      queryClient.setQueryData(
        ['unified-reminders-count', user?.id],
        (old: number | undefined) => Math.max(0, (old || 0) - reminderIds.length)
      );
    },
    onError: (error, reminderIds) => {
      console.error('❌ Failed to batch dismiss reminders:', error);
      reminderIds.forEach(id => dismissingIds.current.delete(id));
      
      queryClient.invalidateQueries({
        queryKey: ['unified-reminders', user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['unified-reminders-count', user?.id],
      });
      
      toast.error('Failed to dismiss reminders. Please try again.');
    },
    onSuccess: (result, reminderIds) => {
      console.log('✅ Batch dismissed reminders:', result);
      reminderIds.forEach(id => dismissingIds.current.delete(id));
      
      // Clean up notification state
      setHasNotified(prev => {
        const newSet = new Set(prev);
        reminderIds.forEach(id => newSet.delete(id));
        return newSet;
      });
      
      if (result.failed_ids?.length > 0) {
        toast.warning(`Dismissed ${result.dismissed_count} reminders. ${result.failed_ids.length} failed.`);
      } else {
        toast.success(`Dismissed ${result.dismissed_count} reminders`);
      }
      
      // Force refresh
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['unified-reminders', user?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ['unified-reminders-count', user?.id],
        });
      }, 100);
    },
  });

  // Dismiss all function
  const dismissAll = useCallback(async () => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      batchDismissMutation.mutate(sentReminderIds);
    }
  }, [reminders, batchDismissMutation]);

  // Check if specific reminder is being dismissed
  const isReminderDismissing = useCallback((reminderId: string) => {
    return dismissingIds.current.has(reminderId);
  }, []);

  return {
    // Data
    reminders,
    totalCount, // This is the accurate count, not limited by pagination
    unreadCount,
    isLoading,
    error,
    
    // Actions
    dismissReminder: dismissMutation.mutate,
    batchDismissReminders: batchDismissMutation.mutate,
    dismissAll,
    refresh: refetch,
    
    // Status
    isDismissing: dismissMutation.isPending,
    isBatchDismissing: batchDismissMutation.isPending,
    isReminderDismissing,
    
    // Backward compatibility
    pendingReminders: reminders, // For existing components
  };
};
