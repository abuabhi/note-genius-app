
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useSessionCleanup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cleanupOrphanedSessions = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Cleaning up orphaned sessions for user:', user.id);

      // Get all active sessions for the user
      const { data: activeSessions, error: fetchError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (fetchError) {
        console.error('Error fetching active sessions:', fetchError);
        return;
      }

      if (activeSessions && activeSessions.length > 0) {
        console.log('Found', activeSessions.length, 'active sessions to clean up');

        // End all active sessions with calculated duration
        const updatePromises = activeSessions.map(session => {
          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - new Date(session.start_time).getTime()) / 1000);
          
          return supabase
            .from('study_sessions')
            .update({
              end_time: endTime.toISOString(),
              duration,
              is_active: false,
              updated_at: endTime.toISOString()
            })
            .eq('id', session.id);
        });

        await Promise.all(updatePromises);
        console.log('Successfully cleaned up orphaned sessions');

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['consolidated-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['unified-study-stats'] });
        queryClient.invalidateQueries({ queryKey: ['enhanced-study-sessions'] });
      }
    } catch (error) {
      console.error('Error during session cleanup:', error);
    }
  }, [user, queryClient]);

  // Run cleanup on mount
  useEffect(() => {
    cleanupOrphanedSessions();
  }, [cleanupOrphanedSessions]);

  return { cleanupOrphanedSessions };
};
