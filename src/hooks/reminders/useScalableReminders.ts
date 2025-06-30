
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Reminder, ReminderStatus, ReminderType } from './types';

interface ScalableRemindersOptions {
  limit?: number;
  status?: ReminderStatus[];
  enableRealtime?: boolean;
  pollingInterval?: number;
}

interface BatchDismissResult {
  dismissed_count: number;
  failed_ids: string[];
}

// Scalable reminder hook optimized for concurrent users
export const useScalableReminders = (options: ScalableRemindersOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    limit = 50,
    status = ['pending', 'sent'],
    enableRealtime = true,
    pollingInterval = 30000 // 30 seconds smart polling
  } = options;

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const dismissingIds = useRef(new Set<string>());

  // Optimized reminder fetching with pagination
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['scalable-reminders', user?.id, { limit, offset, status }],
    queryFn: async () => {
      if (!user) return [];

      console.log('🚀 Fetching scalable reminders with database function');

      const { data, error } = await supabase.rpc('get_user_reminders_paginated', {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: offset,
        p_status: status
      });

      if (error) {
        console.error('❌ Error fetching reminders:', error);
        throw error;
      }

      // Check if we have more data
      setHasMore(data.length === limit);

      console.log('✅ Fetched reminders:', data?.length || 0);
      return data as Reminder[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: enableRealtime ? false : pollingInterval,
  });

  // Smart realtime subscription (only for current user's data)
  useEffect(() => {
    if (!user || !enableRealtime) return;

    console.log('🔄 Setting up scalable realtime subscription');

    const channel = supabase
      .channel(`user-reminders-${user.id}`)
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
          
          // Smart invalidation - only invalidate if data might have changed
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            queryClient.invalidateQueries({
              queryKey: ['scalable-reminders', user.id],
              exact: false,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, enableRealtime, queryClient]);

  // Optimized single reminder dismissal
  const dismissMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🗑️ Dismissing single reminder:', reminderId);
      dismissingIds.current.add(reminderId);

      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) throw error;
      return reminderId;
    },
    onMutate: async (reminderId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: ['scalable-reminders', user?.id] 
      });

      // Optimistic update
      queryClient.setQueriesData(
        { queryKey: ['scalable-reminders', user?.id] },
        (old: Reminder[] | undefined) => {
          if (!old) return old;
          return old.filter(r => r.id !== reminderId);
        }
      );
    },
    onError: (error, reminderId) => {
      console.error('❌ Failed to dismiss reminder:', error);
      dismissingIds.current.delete(reminderId);
      
      // Rollback optimistic update
      queryClient.invalidateQueries({
        queryKey: ['scalable-reminders', user?.id],
        exact: false,
      });
      
      toast.error('Failed to dismiss reminder. Please try again.');
    },
    onSuccess: (reminderId) => {
      console.log('✅ Reminder dismissed successfully:', reminderId);
      dismissingIds.current.delete(reminderId);
      toast.success('Reminder dismissed');
    },
  });

  // Optimized batch dismissal using database function
  const batchDismissMutation = useMutation({
    mutationFn: async (reminderIds: string[]) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🗑️ Batch dismissing reminders:', reminderIds.length);
      reminderIds.forEach(id => dismissingIds.current.add(id));

      const { data, error } = await supabase.rpc('batch_dismiss_reminders', {
        p_user_id: user.id,
        p_reminder_ids: reminderIds
      });

      if (error) throw error;
      return data[0] as BatchDismissResult;
    },
    onMutate: async (reminderIds) => {
      await queryClient.cancelQueries({ 
        queryKey: ['scalable-reminders', user?.id] 
      });

      // Optimistic batch update
      queryClient.setQueriesData(
        { queryKey: ['scalable-reminders', user?.id] },
        (old: Reminder[] | undefined) => {
          if (!old) return old;
          return old.filter(r => !reminderIds.includes(r.id));
        }
      );
    },
    onError: (error, reminderIds) => {
      console.error('❌ Failed to batch dismiss reminders:', error);
      reminderIds.forEach(id => dismissingIds.current.delete(id));
      
      queryClient.invalidateQueries({
        queryKey: ['scalable-reminders', user?.id],
        exact: false,
      });
      
      toast.error('Failed to dismiss reminders. Please try again.');
    },
    onSuccess: (result, reminderIds) => {
      console.log('✅ Batch dismissed reminders:', result);
      reminderIds.forEach(id => dismissingIds.current.delete(id));
      
      if (result.failed_ids.length > 0) {
        toast.warning(`Dismissed ${result.dismissed_count} reminders. ${result.failed_ids.length} failed.`);
      } else {
        toast.success(`Dismissed ${result.dismissed_count} reminders`);
      }
    },
  });

  // Load more function for pagination
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    setOffset(prev => prev + limit);
  }, [hasMore, isLoading, limit]);

  // Check if a reminder is being dismissed
  const isReminderDismissing = useCallback((reminderId: string) => {
    return dismissingIds.current.has(reminderId);
  }, []);

  return {
    reminders,
    isLoading,
    error,
    hasMore,
    loadMore,
    dismissReminder: dismissMutation.mutate,
    batchDismissReminders: batchDismissMutation.mutate,
    isDismissing: dismissMutation.isPending,
    isBatchDismissing: batchDismissMutation.isPending,
    isReminderDismissing,
    refresh: refetch,
  };
};
