
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface SimpleReminder {
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

interface CreateReminderParams {
  title: string;
  description?: string;
  reminder_time: string;
  type: string;
  priority: string;
  delivery_methods: string[];
  recurrence: string;
  status: string;
  due_date?: string;
}

interface UseUnifiedReminderSystemOptions {
  limit?: number;
  enableRealtime?: boolean;
  enableNotifications?: boolean;
}

export const useUnifiedReminderSystem = (options: UseUnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { limit = 50, enableRealtime = false } = options;
  const dismissingIds = useRef(new Set<string>());

  // Query for active reminders only
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['unified-reminders', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('🔄 Fetching PENDING reminders only via UNIFIED SYSTEM...');
      
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
        .eq('status', 'pending')
        .order('reminder_time', { ascending: true, nullsFirst: false })
        .limit(limit);

      if (error) {
        console.error('❌ UNIFIED SYSTEM fetch error:', error);
        throw error;
      }

      console.log(`✅ UNIFIED SYSTEM fetched ${data?.length || 0} pending reminders`);
      return data as SimpleReminder[] || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: enableRealtime ? (process.env.NODE_ENV === 'production' ? 1000 * 300 : 1000 * 60) : false, // 5 minutes in production, 1 minute in dev
  });

  // Set up realtime subscription
  useEffect(() => {
    if (!enableRealtime || !user?.id) return;

    console.log('🔄 Setting up UNIFIED SYSTEM realtime subscription...');
    
    const channel = supabase
      .channel('unified-reminders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 UNIFIED SYSTEM realtime update:', payload);
          
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ 
            queryKey: ['unified-reminders', user.id] 
          });
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up UNIFIED SYSTEM realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, user?.id, queryClient]);

  // Create reminder function
  const createReminder = useCallback(async (params: CreateReminderParams) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    console.log('➕ Creating reminder via UNIFIED SYSTEM:', params);

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        title: params.title,
        description: params.description,
        reminder_time: params.reminder_time,
        type: params.type,
        priority: params.priority,
        delivery_methods: params.delivery_methods,
        recurrence: params.recurrence,
        status: params.status,
        due_date: params.due_date,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ UNIFIED SYSTEM create error:', error);
      throw error;
    }

    console.log('✅ UNIFIED SYSTEM reminder created:', data);

    // Invalidate queries to refresh the list
    queryClient.invalidateQueries({ 
      queryKey: ['unified-reminders', user.id] 
    });

    return data;
  }, [user?.id, queryClient]);

  // Dismiss single reminder with optimistic update
  const dismissReminder = useCallback(async (id: string) => {
    if (!user?.id || dismissingIds.current.has(id)) return;
    
    dismissingIds.current.add(id);
    console.log('🗑️ UNIFIED SYSTEM dismissing reminder:', id);

    // Optimistic update - remove from UI immediately
    queryClient.setQueryData(
      ['unified-reminders', user.id, limit],
      (oldData: SimpleReminder[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(r => r.id !== id);
      }
    );

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'dismissed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      console.log('✅ UNIFIED SYSTEM reminder dismissed successfully');
      toast.success('Reminder dismissed');
    } catch (error) {
      console.error('❌ UNIFIED SYSTEM dismiss error:', error);
      toast.error('Failed to dismiss reminder');
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ 
        queryKey: ['unified-reminders', user.id] 
      });
    } finally {
      dismissingIds.current.delete(id);
    }
  }, [user?.id, queryClient, limit]);

  // Dismiss all reminders with optimistic update
  const dismissAll = useCallback(async () => {
    if (!user?.id || reminders.length === 0) return;
    
    console.log('🗑️ UNIFIED SYSTEM dismissing all reminders:', reminders.length);
    
    const reminderIds = reminders.map(r => r.id);
    
    // Optimistic update - clear UI immediately
    queryClient.setQueryData(
      ['unified-reminders', user.id, limit],
      () => []
    );

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'dismissed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      
      console.log('✅ UNIFIED SYSTEM all reminders dismissed successfully');
      toast.success(`${reminderIds.length} reminders dismissed`);
    } catch (error) {
      console.error('❌ UNIFIED SYSTEM dismiss all error:', error);
      toast.error('Failed to dismiss reminders');
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ 
        queryKey: ['unified-reminders', user.id] 
      });
    }
  }, [user?.id, reminders, queryClient, limit]);

  const refresh = useCallback(() => {
    console.log('🔄 UNIFIED SYSTEM manual refresh triggered');
    queryClient.invalidateQueries({ 
      queryKey: ['unified-reminders', user?.id] 
    });
  }, [queryClient, user?.id]);

  const totalCount = reminders.length;
  const unreadCount = reminders.length; // All active reminders are considered "unread"
  const isDismissing = dismissingIds.current.size > 0;

  return {
    reminders,
    totalCount,
    unreadCount,
    isLoading,
    isDismissing,
    error: error as Error,
    dismissReminder,
    dismissAll,
    refresh,
    createReminder,
  };
};
