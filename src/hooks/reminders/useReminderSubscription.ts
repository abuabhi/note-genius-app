import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useTabVisibility } from '@/hooks/performance/useTabVisibility';
import { useRequestDebounce } from '@/hooks/performance/useRequestDebounce';

export const useReminderSubscription = (onReminderChange: () => void) => {
  const { user } = useAuth();
  const isTabVisible = useTabVisibility();
  const { debouncedCallback: debouncedReminderChange } = useRequestDebounce(onReminderChange, 1000);

  useEffect(() => {
    if (!user) return;
    
    // Set up real-time subscription
    const channel = supabase
      .channel('reminder-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('🔄 Real-time reminder change detected, refreshing...');
          debouncedReminderChange();
        }
      )
      .subscribe();
      
    // Run the fetchPendingReminders function periodically, but only when tab is visible
    // Increased interval for production performance (2 minutes)
    const intervalId = setInterval(() => {
      if (isTabVisible) {
        console.log('🔄 Periodic reminder check...');
        debouncedReminderChange();
      }
    }, 120000); // 2 minutes instead of 30 seconds

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [user, onReminderChange]);
};
