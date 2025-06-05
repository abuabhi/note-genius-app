
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Reminder, ReminderType, ReminderStatus, DeliveryMethod } from "./types";

export const useReminderQueries = () => {
  const { user } = useAuth();

  // Query for active reminders
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["reminders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          events:event_id(*),
          goals:goal_id(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('reminder_time', { ascending: true });

      if (error) {
        console.error('Error fetching reminders:', error);
        throw error;
      }

      // Transform the data to match our type
      return (data || []).map(item => ({
        ...item,
        type: item.type as ReminderType,
        status: item.status as ReminderStatus,
        delivery_methods: Array.isArray(item.delivery_methods) 
          ? item.delivery_methods as DeliveryMethod[]
          : ['in_app' as DeliveryMethod]
      })) as Reminder[];
    },
    enabled: !!user,
  });

  return {
    reminders,
    remindersLoading
  };
};
