
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

// Simple interface that matches our actual database schema
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

const QUERY_KEY = 'unified-reminders';

export const useUnifiedReminderSystem = (options: UseUnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDismissing, setIsDismissing] = useState(false);
  
  const { 
    limit = 100,
    enableRealtime = false,
    enableNotifications = false 
  } = options;

  // Main query to fetch active reminders ONLY
  const { 
    data: reminders = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: [QUERY_KEY, user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('🔍 Fetching UNIFIED reminders - Active only');
      
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
        .order('reminder_time', { ascending: true, nullsLast: true })
        .limit(limit);

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching unified reminders:', error);
        throw error;
      }
      
      console.log('✅ Fetched reminders:', data?.length || 0);
      
      return (data || []).map(reminder => ({
        ...reminder,
        delivery_methods: Array.isArray(reminder.delivery_methods) 
          ? reminder.delivery_methods 
          : ['in_app']
      })) as SimpleReminder[];
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
    refetchInterval: enableNotifications ? 60000 : false // 1 minute for notifications
  });

  // Calculated values
  const totalCount = reminders.length;
  const unreadCount = reminders.length; // All active reminders are "unread"

  // Single reminder dismissal
  const dismissReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      console.log('🗑️ Dismissing single reminder:', reminderId);
      
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'dismissed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('❌ Error dismissing reminder:', error);
        throw error;
      }
      
      return { success: true };
    },
    onMutate: async (reminderId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, user?.id, limit] });
      
      const previousReminders = queryClient.getQueryData([QUERY_KEY, user?.id, limit]);
      
      queryClient.setQueryData([QUERY_KEY, user?.id, limit], (old: SimpleReminder[] = []) => {
        return old.filter(reminder => reminder.id !== reminderId);
      });
      
      return { previousReminders };
    },
    onError: (error, reminderId, context) => {
      console.error('❌ Failed to dismiss reminder:', error);
      queryClient.setQueryData([QUERY_KEY, user?.id, limit], context?.previousReminders);
      toast.error('Failed to dismiss reminder');
    },
    onSuccess: () => {
      console.log('✅ Successfully dismissed reminder');
      toast.success('Reminder dismissed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, user?.id, limit] });
    }
  });

  // Batch dismissal using database function
  const dismissAllMutation = useMutation({
    mutationFn: async () => {
      if (reminders.length === 0) {
        throw new Error('No reminders to dismiss');
      }
      
      console.log('🗑️ Batch dismissing reminders:', reminders.length);
      const reminderIds = reminders.map(r => r.id);
      
      const { data, error } = await supabase.rpc('batch_dismiss_reminders', {
        p_user_id: user?.id,
        p_reminder_ids: reminderIds
      });
      
      if (error) {
        console.error('❌ Batch dismiss error:', error);
        throw error;
      }
      
      console.log('✅ Batch dismiss result:', data);
      return data;
    },
    onMutate: async () => {
      // Optimistic update - clear all reminders
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, user?.id, limit] });
      
      const previousReminders = queryClient.getQueryData([QUERY_KEY, user?.id, limit]);
      
      queryClient.setQueryData([QUERY_KEY, user?.id, limit], []);
      
      return { previousReminders };
    },
    onError: (error, variables, context) => {
      console.error('❌ Failed to dismiss all reminders:', error);
      queryClient.setQueryData([QUERY_KEY, user?.id, limit], context?.previousReminders);
      toast.error('Failed to dismiss reminders');
    },
    onSuccess: (data) => {
      console.log('✅ Successfully dismissed all reminders:', data);
      toast.success(`Dismissed ${data?.[0]?.dismissed_count || 0} reminders`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, user?.id, limit] });
    }
  });

  // Wrapper functions
  const dismissReminder = useCallback((id: string) => {
    dismissReminderMutation.mutate(id);
  }, [dismissReminderMutation]);

  const dismissAll = useCallback(() => {
    dismissAllMutation.mutate();
  }, [dismissAllMutation]);

  const refresh = useCallback(() => {
    console.log('🔄 Refreshing unified reminders');
    refetch();
  }, [refetch]);

  // Set up realtime subscription if enabled
  useEffect(() => {
    if (!enableRealtime || !user?.id) return;

    console.log('🔄 Setting up realtime subscription for unified reminders');
    
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
          console.log('📡 Realtime reminder change:', payload);
          
          // Invalidate and refetch
          queryClient.invalidateQueries({ 
            queryKey: [QUERY_KEY, user.id, limit] 
          });
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, user?.id, queryClient, limit]);

  // Track dismissing state
  useEffect(() => {
    setIsDismissing(dismissReminderMutation.isPending || dismissAllMutation.isPending);
  }, [dismissReminderMutation.isPending, dismissAllMutation.isPending]);

  console.log('🎯 useUnifiedReminderSystem - SIMPLIFIED:', {
    total: totalCount,
    unread: unreadCount,
    loading: isLoading,
    dismissing: isDismissing
  });

  return {
    // Data
    reminders,
    totalCount,
    unreadCount,
    
    // States
    isLoading,
    isDismissing,
    error,
    
    // Actions
    dismissReminder,
    dismissAll,
    refresh
  };
};
