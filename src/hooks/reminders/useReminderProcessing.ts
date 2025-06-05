
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { ReminderStatus, Reminder } from './types';

export const useReminderProcessing = () => {
  const { user } = useAuth();

  const processReminders = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Processing reminders...');
      
      // First try the edge function
      try {
        const response = await fetch(`https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/process-reminders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw`
          }
        });
        
        const result = await response.json();
        console.log('🔄 Process reminders result:', result);
      } catch (edgeFunctionError) {
        console.log('⚠️ Edge function failed, processing locally:', edgeFunctionError);
        // Fallback is handled by the caller
      }
    } catch (error) {
      console.error('❌ Error processing reminders:', error);
    }
  };

  const processLocalReminders = async (pendingReminders: Reminder[]) => {
    if (!user) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const dueReminders = pendingReminders.filter(r => {
      if (r.status !== 'pending') return false;
      
      const reminderTimeDue = r.reminder_time && new Date(r.reminder_time) <= now;
      const dueDateDue = r.type === 'todo' && r.due_date && r.due_date <= today;
      
      return reminderTimeDue || dueDateDue;
    });
    
    if (dueReminders.length > 0) {
      console.log('🔄 Processing locally:', dueReminders);
      
      for (const reminder of dueReminders) {
        await supabase
          .from('reminders')
          .update({ status: 'sent' as ReminderStatus })
          .eq('id', reminder.id)
          .eq('user_id', user.id);
      }
      
      console.log('✅ Local processing completed');
    }
  };

  return {
    processReminders,
    processLocalReminders
  };
};
