
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const useTodaysFocusData = () => {
  const { user } = useAuth();

  console.log('🔍 useTodaysFocusData hook called with user:', user?.id);

  const { data: todaysItems = { reminders: [], goals: [], overdue: [], todos: [] }, isLoading, error } = useQuery({
    queryKey: ['todays-focus', user?.id],
    queryFn: async () => {
      console.log('📡 Fetching todays focus data for user:', user?.id);
      
      if (!user) {
        console.log('❌ No user found, returning empty data');
        return { reminders: [], goals: [], overdue: [], todos: [] };
      }

      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Today date:', today);
      
      try {
        // Get due reminders (excluding todos)
        console.log('🔔 Fetching reminders...');
        const { data: reminders, error: remindersError } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .neq('type', 'todo') // Exclude todos from reminders
          .in('status', ['pending', 'sent'])
          .or(`due_date.eq.${today},reminder_time.gte.${today}T00:00:00,reminder_time.lte.${today}T23:59:59`)
          .order('reminder_time', { ascending: true })
          .limit(5);

        if (remindersError) {
          console.error('❌ Error fetching reminders:', remindersError);
        } else {
          console.log('✅ Fetched reminders:', reminders?.length || 0);
        }

        // Get active goals that should be worked on today
        console.log('🎯 Fetching goals...');
        const { data: goals, error: goalsError } = await supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_completed', false)
          .lte('start_date', today)
          .gte('end_date', today)
          .order('end_date', { ascending: true })
          .limit(3);

        if (goalsError) {
          console.error('❌ Error fetching goals:', goalsError);
        } else {
          console.log('✅ Fetched goals:', goals?.length || 0);
        }

        // Get overdue items (excluding todos)
        console.log('⚠️ Fetching overdue items...');
        const { data: overdue, error: overdueError } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .neq('type', 'todo') // Exclude todos from overdue
          .eq('status', 'pending')
          .lt('due_date', today)
          .order('due_date', { ascending: true })
          .limit(3);

        if (overdueError) {
          console.error('❌ Error fetching overdue items:', overdueError);
        } else {
          console.log('✅ Fetched overdue items:', overdue?.length || 0);
        }

        // Get todos that are due today or overdue
        console.log('📝 Fetching todos...');
        const { data: todos, error: todosError } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'todo')
          .eq('status', 'pending')
          .or(`due_date.eq.${today},due_date.lt.${today}`)
          .order('due_date', { ascending: true })
          .limit(5);

        if (todosError) {
          console.error('❌ Error fetching todos:', todosError);
        } else {
          console.log('✅ Fetched todos:', todos?.length || 0);
          console.log('📋 Todos data:', todos);
        }

        const result = {
          reminders: reminders || [],
          goals: goals || [],
          overdue: overdue || [],
          todos: todos || []
        };

        console.log('📊 Final result:', result);
        return result;
      } catch (error) {
        console.error('💥 Error fetching today\'s items:', error);
        return { reminders: [], goals: [], overdue: [], todos: [] };
      }
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const totalItems = todaysItems.reminders.length + todaysItems.goals.length + todaysItems.overdue.length + todaysItems.todos.length;

  console.log('📈 useTodaysFocusData returning:', { 
    todaysItems, 
    isLoading, 
    totalItems,
    error: error?.message 
  });

  return { todaysItems, isLoading, totalItems };
};
