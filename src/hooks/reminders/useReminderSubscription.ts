import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useReminderSubscription = (onReminderChange: () => void) => {
  const { user } = useAuth();

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
          onReminderChange();
        }
      )
      .subscribe();
      
    // Run the fetchPendingReminders function every 30 seconds to keep it updated
    const intervalId = setInterval(() => {
      console.log('🔄 Periodic reminder check...');
      onReminderChange();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [user, onReminderChange]);
};
