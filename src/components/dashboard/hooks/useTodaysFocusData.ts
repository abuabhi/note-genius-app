
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useUnifiedReminderSystem } from "@/hooks/useUnifiedReminderSystem";

export const useTodaysFocusData = () => {
  const { user } = useAuth();
  
  const { reminders: allReminders } = useUnifiedReminderSystem({
    enableRealtime: false,
    limit: 1000
  });

  const { data: todaysItems = { reminders: [], goals: [], overdue: [], todos: [] }, isLoading, error } = useQuery({
    queryKey: ['todays-focus', user?.id, allReminders.length],
    queryFn: async () => {
      if (!user) return { reminders: [], goals: [], overdue: [], todos: [] };

      const today = new Date().toISOString().split('T')[0];
      
      try {
        const { data: goals } = await supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_completed', false)
          .lte('start_date', today)
          .gte('end_date', today)
          .order('end_date', { ascending: true })
          .limit(3);

        const dueReminders = allReminders.filter(reminder => {
          if (reminder.type === 'todo') return false;
          if (reminder.status === 'cancelled') return false;
          const reminderDate = reminder.reminder_time ? new Date(reminder.reminder_time).toISOString().split('T')[0] : null;
          const dueDate = reminder.due_date;
          return (dueDate === today) || (reminderDate === today) || (reminder.status === 'sent' && (!reminderDate || reminderDate <= today));
        }).slice(0, 5);

        const overdueItems = allReminders.filter(reminder => {
          if (reminder.type === 'todo') return false;
          if (reminder.status !== 'pending') return false;
          return reminder.due_date && reminder.due_date < today;
        }).slice(0, 3);

        const todoItems = allReminders.filter(reminder => {
          return reminder.type === 'todo' && reminder.status === 'pending';
        }).slice(0, 5);

        return {
          reminders: dueReminders || [],
          goals: goals || [],
          overdue: overdueItems || [],
          todos: todoItems || []
        };
      } catch {
        return { reminders: [], goals: [], overdue: [], todos: [] };
      }
    },
    enabled: !!user && allReminders.length >= 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const totalItems = todaysItems.reminders.length + todaysItems.goals.length + todaysItems.overdue.length + todaysItems.todos.length;

  return { todaysItems, isLoading, totalItems };
};
