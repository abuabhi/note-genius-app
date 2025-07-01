
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CleanupResult {
  deleted_count: number;
  archived_count: number;
  cleanup_summary: {
    cleanup_date: string;
    retention_days: number;
    archived_count: number;
    deleted_count: number;
    cleanup_timestamp: string;
  };
}

export const useReminderCleanup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<CleanupResult> => {
      console.log('🧹 Starting manual reminder cleanup...');
      
      const { data, error } = await supabase.functions.invoke('cleanup-reminders');
      
      if (error) {
        console.error('❌ Cleanup error:', error);
        throw error;
      }
      
      console.log('✅ Cleanup completed:', data.result);
      return data.result;
    },
    onSuccess: (result) => {
      toast.success(
        `Cleanup completed: ${result.archived_count} archived, ${result.deleted_count} deleted`
      );
      
      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ['unified-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminder-system-health'] });
    },
    onError: (error) => {
      console.error('❌ Failed to run cleanup:', error);
      toast.error('Failed to run cleanup process');
    },
  });
};
