
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useTodaysFocusData = () => {
  const { user } = useAuth();

  const { data: todaysItems = { reminders: [], goals: [], overdue: [], todos: [] }, isLoading } = useQuery({
    queryKey: ['todays-focus', user?.id],
    queryFn: async () => {
      if (!user) return { reminders: [], goals: [], overdue: [], todos: [] };

      const today = new Date().toISOString().split('T')[0];
      
      try {
        // Get due reminders
        const { data: reminders } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['pending', 'sent'])
          .or(`due_date.eq.${today},reminder_time.gte.${today}T00:00:00,reminder_time.lte.${today}T23:59:59`)
          .order('reminder_time', { ascending: true })
          .limit(5);

        // Get active goals that should be worked on today
        const { data: goals } = await supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_completed', false)
          .lte('start_date', today)
          .gte('end_date', today)
          .order('end_date', { ascending: true })
          .limit(3);

        // Get overdue items
        const { data: overdue } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .lt('due_date', today)
          .order('due_date', { ascending: true })
          .limit(3);

        // Get pending todos due today or overdue
        const { data: todos } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'todo')
          .eq('status', 'pending')
          .or(`due_date.eq.${today},due_date.lt.${today}`)
          .order('due_date', { ascending: true })
          .limit(5);

        return {
          reminders: reminders || [],
          goals: goals || [],
          overdue: overdue || [],
          todos: todos || []
        };
      } catch (error) {
        console.error('Error fetching today\'s items:', error);
        return { reminders: [], goals: [], overdue: [], todos: [] };
      }
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const totalItems = todaysItems.reminders.length + todaysItems.goals.length + todaysItems.overdue.length + todaysItems.todos.length;

  return { todaysItems, isLoading, totalItems };
};
