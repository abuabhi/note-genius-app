
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  due_date?: string | null;
  type: string;
  status: string;
  priority: string;
  delivery_methods: string[];
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDismissing, setIsDismissing] = useState(false);

  // Query for active notifications (pending + sent)
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .order('reminder_time', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('🔄 Notification change detected, refreshing...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const dismissNotification = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      setIsDismissing(true);
      
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'dismissed', updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Optimistically update the cache
      queryClient.setQueryData(['notifications', user.id], (old: Notification[] = []) =>
        old.filter(n => n.id !== id)
      );

      console.log('✅ Notification dismissed:', id);
      return true;
    } catch (error) {
      console.error('❌ Error dismissing notification:', error);
      return false;
    } finally {
      setIsDismissing(false);
    }
  }, [user, queryClient]);

  const dismissAll = useCallback(async () => {
    if (!user || notifications.length === 0) return false;

    try {
      setIsDismissing(true);
      
      const notificationIds = notifications.map(n => n.id);
      
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'dismissed', updated_at: new Date().toISOString() })
        .in('id', notificationIds)
        .eq('user_id', user.id);

      if (error) throw error;

      // Clear the cache
      queryClient.setQueryData(['notifications', user.id], []);

      console.log('✅ All notifications dismissed');
      return true;
    } catch (error) {
      console.error('❌ Error dismissing all notifications:', error);
      return false;
    } finally {
      setIsDismissing(false);
    }
  }, [user, notifications, queryClient]);

  const createNotification = useCallback(async (data: {
    title: string;
    description?: string;
    reminder_time: Date;
    type: string;
    priority?: string;
    delivery_methods?: string[];
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          reminder_time: data.reminder_time.toISOString(),
          type: data.type,
          priority: data.priority || 'medium',
          delivery_methods: data.delivery_methods || ['in_app'],
          status: 'pending'
        });

      if (error) throw error;

      console.log('✅ Notification created');
      refetch();
      return true;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return false;
    }
  }, [user, refetch]);

  // Get counts
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => n.status === 'pending').length;

  return {
    notifications,
    totalCount,
    unreadCount,
    isLoading,
    isDismissing,
    dismissNotification,
    dismissAll,
    createNotification,
    refresh: refetch
  };
};
