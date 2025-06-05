
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { ReminderStatus } from './types';

export const useReminderActions = () => {
  const { user } = useAuth();

  const dismissReminder = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'dismissed' as ReminderStatus })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      return false;
    }
  };

  const dismissAll = async (reminderIds: string[]) => {
    if (!user || reminderIds.length === 0) return false;

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'dismissed' as ReminderStatus })
        .in('id', reminderIds)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error dismissing all reminders:', error);
      return false;
    }
  };

  return {
    dismissReminder,
    dismissAll
  };
};
