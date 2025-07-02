
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';

// Simplified reminder interface - only what we actually need
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

interface UseUnifiedReminderSystemOptions {
  limit?: number;
  enableRealtime?: boolean;
  enableNotifications?: boolean;
}

export const useUnifiedReminderSystem = (options: UseUnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { limit = 20, enableRealtime = false } = options;

  console.log('🔔 useUnifiedReminderSystem initialized for user:', user?.id);

  // Query for active reminders only - no more pending/sent confusion
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch: refresh
  } = useQuery({
    queryKey: ['unified-reminders', user?.id, limit],
    queryFn: async () => {
      if (!user) {
        console.log('❌ No user found for reminders query');
        return [];
      }

      console.log('🔍 Fetching active reminders for user:', user.id);

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
          recurrence,
          delivery_methods,
          priority,
          created_at,
          updated_at,
          events:event_id(id, title),
          goals:goal_id(id, title)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active') // Only fetch active reminders
        .order('reminder_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching reminders:', error);
        throw error;
      }

      console.log('✅ Fetched reminders:', data?.length || 0);
      return (data || []) as SimpleReminder[];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Realtime subscription for active reminders
  useEffect(() => {
    if (!enableRealtime || !user) return;

    console.log('🔄 Setting up realtime subscription for reminders');

    const channel = supabase
      .channel('unified-reminders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Realtime reminder update:', payload);
          queryClient.invalidateQueries({ queryKey: ['unified-reminders', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, user, queryClient]);

  // Single dismiss reminder mutation - no more complexity
  const dismissReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('🗑️ Dismissing single reminder:', reminderId);

      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'dismissed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error dismissing reminder:', error);
        throw error;
      }

      return reminderId;
    },
    onMutate: async (reminderId) => {
      // Optimistic update - remove from UI immediately
      const queryKey = ['unified-reminders', user?.id, limit];
      await queryClient.cancelQueries({ queryKey });
      
      const previousReminders = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: SimpleReminder[] = []) =>
        old.filter(reminder => reminder.id !== reminderId)
      );
      
      return { previousReminders };
    },
    onError: (error, reminderId, context) => {
      console.error('❌ Error dismissing reminder:', error);
      
      // Rollback on error
      if (context?.previousReminders) {
        queryClient.setQueryData(['unified-reminders', user?.id, limit], context.previousReminders);
      }
      
      toast.error('Failed to dismiss reminder');
    },
    onSuccess: (reminderId) => {
      console.log('✅ Successfully dismissed reminder:', reminderId);
      toast.success('Reminder dismissed');
      
      // Refresh to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['unified-reminders', user?.id] });
    },
  });

  // Batch dismiss all active reminders
  const dismissAllMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const activeReminderIds = reminders.map(r => r.id);
      
      if (activeReminderIds.length === 0) {
        throw new Error('No active reminders to dismiss');
      }

      console.log('🗑️ Dismissing all reminders:', activeReminderIds.length);

      const { data, error } = await supabase.rpc('batch_dismiss_reminders', {
        p_user_id: user.id,
        p_reminder_ids: activeReminderIds
      });

      if (error) {
        console.error('❌ Error dismissing all reminders:', error);
        throw error;
      }

      console.log('✅ Batch dismiss result:', data);
      return data;
    },
    onMutate: async () => {
      // Optimistic update - clear all reminders from UI
      const queryKey = ['unified-reminders', user?.id, limit];
      await queryClient.cancelQueries({ queryKey });
      
      const previousReminders = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, []);
      
      return { previousReminders };
    },
    onError: (error, variables, context) => {
      console.error('❌ Error dismissing all reminders:', error);
      
      // Rollback on error
      if (context?.previousReminders) {
        queryClient.setQueryData(['unified-reminders', user?.id, limit], context.previousReminders);
      }
      
      toast.error('Failed to dismiss all reminders');
    },
    onSuccess: (data) => {
      console.log('✅ Successfully dismissed all reminders:', data);
      toast.success(`Dismissed ${data?.[0]?.dismissed_count || 0} reminders`);
      
      // Refresh to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['unified-reminders', user?.id] });
    },
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: Partial<SimpleReminder>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminderData,
          user_id: user.id,
          status: 'active', // Always create as active
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Reminder created');
      queryClient.invalidateQueries({ queryKey: ['unified-reminders', user?.id] });
    },
    onError: (error) => {
      console.error('❌ Error creating reminder:', error);
      toast.error('Failed to create reminder');
    },
  });

  // Calculated values - simplified
  const totalCount = reminders.length;
  const unreadCount = totalCount; // All active reminders are "unread"

  return {
    // Data
    reminders,
    totalCount,
    unreadCount,
    isLoading,
    error,
    
    // Actions
    dismissReminder: dismissReminderMutation.mutate,
    dismissAll: dismissAllMutation.mutate,
    createReminder: createReminderMutation.mutate,
    refresh,
    
    // Loading states
    isDismissing: dismissReminderMutation.isPending || dismissAllMutation.isPending,
  };
};
