import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Simple reminder interface that matches database reality
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
  delivery_methods: string[]; // Convert from Json to string[]
  priority: string;
  created_at: string;
  updated_at: string;
  events?: { id: string; title: string } | null;
  goals?: { id: string; title: string } | null;
}

export interface UseUnifiedReminderSystemOptions {
  limit?: number;
  enableRealtime?: boolean;
  enableNotifications?: boolean;
  status?: string[]; // Add status filtering support
}

// Utility function to safely convert Json to string array
const convertDeliveryMethods = (methods: any): string[] => {
  if (Array.isArray(methods)) {
    return methods;
  }
  if (typeof methods === 'string') {
    try {
      const parsed = JSON.parse(methods);
      return Array.isArray(parsed) ? parsed : ['in_app'];
    } catch {
      return ['in_app'];
    }
  }
  return ['in_app'];
};

export const useUnifiedReminderSystem = (options: UseUnifiedReminderSystemOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    limit = 20, 
    enableRealtime = false, 
    enableNotifications = false,
    status = ['pending', 'sent']
  } = options;
  
  const queryKey = ['unified-reminders', user?.id, limit, status];
  
  // Keep track of shown notifications
  const shownNotifications = useRef(new Set<string>());
  
  // Main query for fetching reminders
  const {
    data: rawReminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return [];
      
      console.log('📡 Fetching unified reminders for user:', user.id, 'limit:', limit);
      
      let query = supabase
        .from('reminders')
        .select(`
          *,
          events:event_id(id, title),
          goals:goal_id(id, title)
        `)
        .eq('user_id', user.id)
        .in('status', status)
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
      
      // Convert delivery_methods from Json to string[]
      const convertedData = (data || []).map(reminder => ({
        ...reminder,
        delivery_methods: convertDeliveryMethods(reminder.delivery_methods)
      }));
      
      return convertedData;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: enableRealtime ? 30 * 1000 : false,
  });

  // Convert raw data to SimpleReminder format
  const reminders: SimpleReminder[] = rawReminders;
  
  // Calculate counts
  const totalCount = reminders.length;
  const unreadCount = reminders.filter(r => r.status === 'sent').length;
  
  // Real-time subscription
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
          console.log('🔄 Realtime reminder change:', payload);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();
    
    return () => {
      console.log('🔄 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, user?.id, queryClient, queryKey]);
  
  // Dismiss single reminder
  const dismissReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      console.log('🗑️ Dismissing reminder via UNIFIED SYSTEM:', reminderId);
      
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return reminderId;
    },
    onSuccess: (reminderId) => {
      queryClient.invalidateQueries({ queryKey });
      console.log('✅ Reminder dismissed successfully via UNIFIED SYSTEM:', reminderId);
    },
    onError: (error) => {
      console.error('❌ Error dismissing reminder via UNIFIED SYSTEM:', error);
      toast.error('Failed to dismiss reminder');
    }
  });
  
  // Batch dismiss reminders
  const batchDismissRemindersMutation = useMutation({
    mutationFn: async (reminderIds: string[]) => {
      console.log('🗑️ Batch dismissing reminders via UNIFIED SYSTEM:', reminderIds.length);
      
      const { data, error } = await supabase.rpc('batch_dismiss_reminders', {
        p_user_id: user?.id,
        p_reminder_ids: reminderIds
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      console.log('✅ Batch dismiss completed via UNIFIED SYSTEM');
    },
    onError: (error) => {
      console.error('❌ Error batch dismissing reminders via UNIFIED SYSTEM:', error);
      toast.error('Failed to dismiss reminders');
    }
  });
  
  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: any) => {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminderData,
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Reminder created successfully');
    },
    onError: (error) => {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
    }
  });
  
  // Dismiss all sent reminders
  const dismissAll = () => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      batchDismissRemindersMutation.mutate(sentReminderIds);
    }
  };
  
  return {
    // Data
    reminders,
    totalCount,
    unreadCount,
    
    // Loading states
    isLoading,
    error,
    isDismissing: dismissReminderMutation.isPending || batchDismissRemindersMutation.isPending,
    
    // Actions
    dismissReminder: dismissReminderMutation.mutate,
    batchDismissReminders: batchDismissRemindersMutation.mutate,
    createReminder: createReminderMutation.mutate,
    dismissAll,
    refresh: refetch,
  };
};
