
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { Reminder } from './reminders/types';

interface UnifiedReminderSystemOptions {
  enableRealtime?: boolean;
  enableNotifications?: boolean;
  limit?: number;
}

export const useUnifiedReminderSystem = (options: UnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    enableRealtime = true, 
    enableNotifications = true,
    limit = 50 
  } = options;
  
  // Track processed notifications to prevent duplicates
  const processedNotifications = useRef(new Set<string>());

  // Unified query for reminders with pagination
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['unified-reminders', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('🔄 Fetching reminders for user:', user.id);
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .order('reminder_time', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching reminders:', error);
        throw error;
      }

      console.log('✅ Fetched reminders:', data?.length || 0);
      return (data || []) as Reminder[];
    },
    enabled: !!user,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute as backup
  });

  // Separate query for total count (not limited)
  const {
    data: totalCount = 0,
  } = useQuery({
    queryKey: ['unified-reminders-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent']);

      if (error) {
        console.error('❌ Error fetching reminder count:', error);
        throw error;
      }

      console.log('📊 Total reminder count:', count || 0);
      return count || 0;
    },
    enabled: !!user,
    staleTime: 30000,
  });

  // Calculate unread count (pending reminders)
  const unreadCount = reminders.filter(r => r.status === 'pending').length;

  // Enhanced refresh function that works with button clicks
  const refresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['unified-reminders', user?.id] }),
      queryClient.invalidateQueries({ queryKey: ['unified-reminders-count', user?.id] })
    ]);
  }, [queryClient, user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime || !user) return;

    console.log('🔌 Setting up realtime subscription for user:', user.id);
    
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
          console.log('📡 Realtime update received:', payload.eventType, payload.new);
          
          // Type-safe payload handling
          const newReminder = payload.new as Record<string, any>;
          if (payload.eventType === 'INSERT' && newReminder?.id) {
            console.log('➕ New reminder created:', newReminder.title);
            
            if (enableNotifications && newReminder.status === 'sent' && !processedNotifications.current.has(newReminder.id)) {
              processedNotifications.current.add(newReminder.id);
              toast(`New reminder: ${newReminder.title}`, {
                description: newReminder.description || 'You have a new reminder',
                duration: 8000,
              });
            }
          }
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ 
            queryKey: ['unified-reminders', user.id] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['unified-reminders-count', user.id] 
          });
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, enableNotifications, user, queryClient]);

  // Dismiss single reminder mutation
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

      if (error) throw error;
      
      // Remove from processed notifications if it was there
      processedNotifications.current.delete(reminderId);
      
      return reminderId;
    },
    onSuccess: (reminderId) => {
      console.log('✅ Reminder dismissed successfully:', reminderId);
      toast.success('Reminder dismissed');
      
      // Optimistically update the cache
      queryClient.setQueryData<Reminder[]>(
        ['unified-reminders', user?.id, limit],
        (old) => old?.filter(r => r.id !== reminderId) || []
      );
      
      // Update count
      queryClient.setQueryData<number>(
        ['unified-reminders-count', user?.id],
        (old) => Math.max(0, (old || 0) - 1)
      );
    },
    onError: (error) => {
      console.error('❌ Failed to dismiss reminder:', error);
      toast.error('Failed to dismiss reminder');
    },
  });

  // Batch dismiss mutation
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
      
      // Clean up processed notifications
      reminderIds.forEach(id => processedNotifications.current.delete(id));
      
      return reminderIds;
    },
    onSuccess: (reminderIds) => {
      console.log('✅ Batch dismiss successful:', reminderIds.length);
      toast.success(`${reminderIds.length} reminders dismissed`);
      refresh();
    },
    onError: (error) => {
      console.error('❌ Batch dismiss failed:', error);
      toast.error('Failed to dismiss reminders');
    },
  });

  const dismissReminder = (id: string) => {
    dismissMutation.mutate(id);
  };

  const batchDismissReminders = (ids: string[]) => {
    batchDismissMutation.mutate(ids);
  };

  const dismissAll = async () => {
    const pendingIds = reminders
      .filter(r => r.status === 'pending')
      .map(r => r.id);
    
    if (pendingIds.length > 0) {
      batchDismissReminders(pendingIds);
    }
  };

  return {
    reminders,
    totalCount,
    unreadCount,
    isLoading,
    error,
    refresh,
    dismissReminder,
    batchDismissReminders,
    dismissAll,
    isDismissing: dismissMutation.isPending || batchDismissMutation.isPending,
  };
};
