
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReminderSystemHealth {
  timestamp: string;
  total_reminders: number;
  pending_reminders: number;
  overdue_reminders: number;
  failed_reminders: number;
  processed_today: number;
  avg_processing_time_seconds: number;
  system_status: 'healthy' | 'warning' | 'critical';
  performance_metrics: {
    success_rate: number;
    processing_efficiency: number;
  };
}

export const useReminderSystemHealth = () => {
  return useQuery({
    queryKey: ['reminder-system-health'],
    queryFn: async (): Promise<ReminderSystemHealth> => {
      const { data, error } = await supabase.functions.invoke('reminder-system-health');
      
      if (error) {
        console.error('Error fetching system health:', error);
        throw error;
      }
      
      return data.health;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};
