
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

// Simple reminder interface that matches database structure
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

export interface CreateReminderData {
  title: string;
  description?: string;
  reminder_time: string;
  due_date?: string;
  type: string;
  priority: string;
  delivery_methods: string[];
  recurrence: string;
  status: string;
}

interface UseUnifiedReminderSystemOptions {
  enableRealtime?: boolean;
  enableNotifications?: boolean;
  limit?: number;
}

export const useUnifiedReminderSystem = (options: UseUnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enableRealtime = false, enableNotifications = false, limit = 50 } = options;

  console.log('🔔 useUnifiedReminderSystem initialized with options:', options);

  // Query for reminders using React Query
  const {
    data: reminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['unified-reminders', user?.id, limit],
    queryFn: async (): Promise<SimpleReminder[]> => {
      if (!user) {
        console.log('❌ No user found, returning empty reminders');
        return [];
      }

      console.log('📡 Fetching unified reminders for user:', user.id, 'limit:', limit);

      try {
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
          .neq('status', 'cancelled') // Exclude cancelled reminders
          .order('reminder_time', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (limit > 0) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching unified reminders:', error);
          throw error;
        }

        console.log('✅ Fetched unified reminders:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('💥 Error in unified reminders query:', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: enableRealtime ? 30000 : false, // Poll every 30s if realtime enabled
  });

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: CreateReminderData) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📝 Creating reminder via unified system:', reminderData);

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: reminderData.title,
          description: reminderData.description,
          reminder_time: reminderData.reminder_time,
          due_date: reminderData.due_date || null,
          type: reminderData.type,
          status: reminderData.status,
          priority: reminderData.priority,
          delivery_methods: reminderData.delivery_methods,
          recurrence: reminderData.recurrence
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating reminder:', error);
        throw error;
      }

      console.log('✅ Created reminder via unified system:', data.id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['todays-focus'] });
    },
    onError: (error: Error) => {
      console.error('💥 Create reminder error:', error);
      toast.error(`Failed to create reminder: ${error.message}`);
    },
  });

  // Dismiss single reminder mutation
  const dismissReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('🗑️ Dismissing reminder via unified system:', reminderId);

      const { data, error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',  // Mark as cancelled instead of sent
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error dismissing reminder:', error);
        throw error;
      }

      console.log('✅ Dismissed reminder via unified system:', reminderId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['todays-focus'] });
    },
    onError: (error: Error) => {
      console.error('💥 Dismiss reminder error:', error);
      toast.error(`Failed to dismiss reminder: ${error.message}`);
    },
  });

  // Batch dismiss reminders mutation
  const batchDismissRemindersMutation = useMutation({
    mutationFn: async (reminderIds: string[]) => {
      if (!user) throw new Error('User not authenticated');

      console.log('🗑️ Batch dismissing reminders via unified system:', reminderIds.length);

      const { data, error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',  // Mark as cancelled instead of sent
          updated_at: new Date().toISOString()
        })
        .in('id', reminderIds)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('❌ Error batch dismissing reminders:', error);
        throw error;
      }

      console.log('✅ Batch dismissed reminders via unified system:', data?.length || 0);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['todays-focus'] });
    },
    onError: (error: Error) => {
      console.error('💥 Batch dismiss reminders error:', error);
      toast.error(`Failed to dismiss reminders: ${error.message}`);
    },
  });

  // Computed values
  const totalCount = reminders.length;
  const unreadCount = reminders.filter(r => r.status === 'sent').length;

  // Callback functions
  const createReminder = useCallback((data: CreateReminderData) => {
    return createReminderMutation.mutateAsync(data);
  }, [createReminderMutation]);

  const dismissReminder = useCallback((id: string) => {
    dismissReminderMutation.mutate(id);
  }, [dismissReminderMutation]);

  const batchDismissReminders = useCallback((ids: string[]) => {
    batchDismissRemindersMutation.mutate(ids);
  }, [batchDismissRemindersMutation]);

  const dismissAll = useCallback(() => {
    const dismissableIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (dismissableIds.length > 0) {
      batchDismissReminders(dismissableIds);
    }
  }, [reminders, batchDismissReminders]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime || !user) return;

    console.log('🔄 Setting up realtime subscription for unified reminders');

    const channel = supabase
      .channel('unified-reminders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Realtime reminder update via unified system:', payload);
          queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
          queryClient.invalidateQueries({ queryKey: ['todays-focus'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up realtime subscription for unified reminders');
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, user, queryClient]);

  return {
    reminders,
    totalCount,
    unreadCount,
    isLoading,
    error,
    createReminder,
    dismissReminder,
    batchDismissReminders,
    dismissAll,
    isDismissing: dismissReminderMutation.isPending || batchDismissRemindersMutation.isPending,
    isCreating: createReminderMutation.isPending,
    refresh
  };
};
