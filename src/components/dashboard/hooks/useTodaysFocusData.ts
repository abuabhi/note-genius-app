
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useUnifiedReminderSystem } from "@/hooks/useUnifiedReminderSystem";

export const useTodaysFocusData = () => {
  const { user } = useAuth();
  
  // Use unified reminder system instead of separate queries
  const { reminders: allReminders } = useUnifiedReminderSystem({
    enableRealtime: false,
    limit: 1000 // Get more reminders to filter properly
  });

  console.log('🔍 useTodaysFocusData hook called with user:', user?.id);

  const { data: todaysItems = { reminders: [], goals: [], overdue: [], todos: [] }, isLoading, error } = useQuery({
    queryKey: ['todays-focus', user?.id, allReminders.length],
    queryFn: async () => {
      console.log('📡 Fetching todays focus data for user:', user?.id);
      
      if (!user) {
        console.log('❌ No user found, returning empty data');
        return { reminders: [], goals: [], overdue: [], todos: [] };
      }

      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Today date:', today);
      
      try {
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

        // Filter reminders from unified system instead of making separate queries
        console.log('🔔 Processing reminders from unified system...');
        const dueReminders = allReminders.filter(reminder => {
          // Due reminders (excluding todos)
          if (reminder.type === 'todo') return false;
          if (reminder.status === 'cancelled') return false;
          
          const reminderDate = reminder.reminder_time ? new Date(reminder.reminder_time).toISOString().split('T')[0] : null;
          const dueDate = reminder.due_date;
          
          return (dueDate === today) || 
                 (reminderDate === today) ||
                 (reminder.status === 'sent' && (!reminderDate || reminderDate <= today));
        }).slice(0, 5);

        console.log('✅ Filtered due reminders:', dueReminders.length);

        // Filter overdue items from unified system
        console.log('⚠️ Processing overdue items...');
        const overdueItems = allReminders.filter(reminder => {
          if (reminder.type === 'todo') return false;
          if (reminder.status !== 'pending') return false;
          return reminder.due_date && reminder.due_date < today;
        }).slice(0, 3);

        console.log('✅ Filtered overdue items:', overdueItems.length);

        // Filter todos from unified system
        console.log('📝 Processing todos...');
        const todoItems = allReminders.filter(reminder => {
          return reminder.type === 'todo' && reminder.status === 'pending';
        }).slice(0, 5);

        console.log('✅ Filtered todos:', todoItems.length);

        const result = {
          reminders: dueReminders || [],
          goals: goals || [],
          overdue: overdueItems || [],
          todos: todoItems || []
        };

        console.log('📊 Final result summary:', {
          reminders: result.reminders.length,
          goals: result.goals.length,
          overdue: result.overdue.length,
          todos: result.todos.length
        });
        
        return result;
      } catch (error) {
        console.error('💥 Error fetching today\'s items:', error);
        return { reminders: [], goals: [], overdue: [], todos: [] };
      }
    },
    enabled: !!user && allReminders.length >= 0, // Wait for reminders to load
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const totalItems = todaysItems.reminders.length + todaysItems.goals.length + todaysItems.overdue.length + todaysItems.todos.length;

  console.log('📈 useTodaysFocusData returning:', { 
    todaysItems, 
    isLoading, 
    totalItems,
    todosCount: todaysItems?.todos?.length || 0,
    error: error?.message 
  });

  return { todaysItems, isLoading, totalItems };
};
