
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useReminderSubscription } from './reminders/useReminderSubscription';

interface UnifiedReminderOptions {
  limit?: number;
  enableRealtime?: boolean;
  enableNotifications?: boolean;
}

interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  due_date?: string | null;
  type: string;
  status: string;
  priority: string;
  escalation_level?: string;
  delivery_methods: string[];
  recurrence: string;
  created_at: string;
  updated_at: string;
  events?: any;
  goals?: any;
}

export const useUnifiedReminderSystem = (options: UnifiedReminderOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDismissing, setIsDismissing] = useState(false);
  
  const {
    limit = 1000,
    enableRealtime = true,
    enableNotifications = true
  } = options;

  console.log('🔄 UnifiedReminderSystem initialized with options:', { limit, enableRealtime, enableNotifications });

  // Memoized query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => ['unified-reminders', user?.id], [user?.id]);

  // Main query for fetching reminders
  const {
    data: rawReminders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) {
        console.log('🚫 No user found, returning empty reminders');
        return [];
      }

      console.log('📡 Fetching reminders for user:', user.id);
      
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          events:event_id(*),
          goals:goal_id(*)
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .order('reminder_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching reminders:', error);
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} reminders`);
      return data || [];
    },
    enabled: !!user,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Process reminders to ensure proper typing
  const reminders: Reminder[] = useMemo(() => {
    return rawReminders.map(reminder => ({
      ...reminder,
      delivery_methods: Array.isArray(reminder.delivery_methods) 
        ? reminder.delivery_methods 
        : ['in_app']
    }));
  }, [rawReminders]);

  // Calculate counts
  const totalCount = reminders.length;
  const unreadCount = reminders.filter(r => r.status === 'sent').length;

  // Debounced refresh function to prevent excessive API calls
  const debouncedRefresh = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log('🔄 Debounced refresh triggered');
          queryClient.invalidateQueries({ queryKey });
        }, 500);
      };
    })(),
    [queryClient, queryKey]
  );

  // Real-time subscription - SIMPLIFIED to allow all updates through
  useReminderSubscription(
    enableRealtime ? debouncedRefresh : () => {}
  );

  // Single reminder dismiss function using optimistic updates
  const dismissReminder = useCallback(async (id: string) => {
    if (!user || isDismissing) return;

    console.log('🗑️ Dismissing single reminder:', id);
    
    try {
      setIsDismissing(true);

      // Optimistic update - immediately remove from UI
      queryClient.setQueryData(queryKey, (oldData: Reminder[] = []) => {
        const newData = oldData.filter(r => r.id !== id);
        console.log(`📱 Optimistic update: ${oldData.length} → ${newData.length} reminders`);
        return newData;
      });

      // Update database
      const { error } = await supabase
        .from('reminders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error dismissing reminder:', error);
        
        // Revert optimistic update on error
        await queryClient.invalidateQueries({ queryKey });
        toast.error('Failed to dismiss reminder');
        return;
      }

      console.log('✅ Reminder dismissed successfully');
      toast.success('Reminder dismissed');

    } catch (error) {
      console.error('❌ Error in dismissReminder:', error);
      
      // Revert optimistic update on error
      await queryClient.invalidateQueries({ queryKey });
      toast.error('Failed to dismiss reminder');
    } finally {
      setIsDismissing(false);
    }
  }, [user, queryClient, queryKey, isDismissing]);

  // Batch dismiss function using database function
  const batchDismissReminders = useCallback(async (reminderIds: string[]) => {
    if (!user || isDismissing || reminderIds.length === 0) return;

    console.log('🗑️ Batch dismissing reminders:', reminderIds.length);
    
    try {
      setIsDismissing(true);

      // Optimistic update - immediately remove from UI
      queryClient.setQueryData(queryKey, (oldData: Reminder[] = []) => {
        const newData = oldData.filter(r => !reminderIds.includes(r.id));
        console.log(`📱 Optimistic update: ${oldData.length} → ${newData.length} reminders`);
        return newData;
      });

      // Use the database function for atomic batch operations
      const { data, error } = await supabase.rpc('batch_dismiss_reminders', {
        p_user_id: user.id,
        p_reminder_ids: reminderIds
      });

      if (error) {
        console.error('❌ Error batch dismissing reminders:', error);
        
        // Revert optimistic update on error
        await queryClient.invalidateQueries({ queryKey });
        toast.error('Failed to dismiss reminders');
        return;
      }

      const result = data?.[0];
      if (result) {
        console.log(`✅ Batch dismissed ${result.dismissed_count} reminders`);
        
        if (result.failed_ids?.length > 0) {
          console.warn('⚠️ Some reminders failed to dismiss:', result.failed_ids);
          toast.warning(`${result.dismissed_count} dismissed, ${result.failed_ids.length} failed`);
        } else {
          toast.success(`${result.dismissed_count} reminders dismissed`);
        }
      } else {
        console.log('✅ Batch dismiss completed');
        toast.success('Reminders dismissed');
      }

    } catch (error) {
      console.error('❌ Error in batchDismissReminders:', error);
      
      // Revert optimistic update on error
      await queryClient.invalidateQueries({ queryKey });
      toast.error('Failed to dismiss reminders');
    } finally {
      setIsDismissing(false);
    }
  }, [user, queryClient, queryKey, isDismissing]);

  // Convenience function to dismiss all sent reminders
  const dismissAll = useCallback(() => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      console.log('🗑️ Dismissing all sent reminders:', sentReminderIds.length);
      batchDismissReminders(sentReminderIds);
    }
  }, [reminders, batchDismissReminders]);

  // Manual refresh function
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    return refetch();
  }, [refetch]);

  return {
    reminders,
    totalCount,
    unreadCount,
    isLoading,
    error,
    isDismissing,
    dismissReminder,
    batchDismissReminders,
    dismissAll,
    refresh,
  };
};
