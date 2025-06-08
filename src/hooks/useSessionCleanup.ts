
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { config, logger } from '@/config/environment';

const MAX_SESSION_DURATION = 4 * 60 * 60; // 4 hours in seconds
const MIN_SESSION_DURATION = 60; // 1 minute in seconds

export const useSessionCleanup = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const cleanupOrphanedSessions = async () => {
      try {
        logger.info('🧹 Starting session cleanup for user:', user.id);

        // Find sessions that are still marked as active but are unrealistic
        const { data: activeSessions, error: fetchError } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('start_time', { ascending: false });

        if (fetchError) {
          logger.error('Error fetching active sessions:', fetchError);
          return;
        }

        if (!activeSessions || activeSessions.length === 0) {
          logger.info('✅ No active sessions to clean up');
          return;
        }

        const now = new Date();
        const sessionsToCleanup = [];

        for (const session of activeSessions) {
          const startTime = new Date(session.start_time);
          const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          
          // Session has been running for more than 4 hours - likely orphaned
          if (elapsedSeconds > MAX_SESSION_DURATION) {
            sessionsToCleanup.push({
              ...session,
              calculatedDuration: Math.min(elapsedSeconds, 3600) // Cap at 1 hour for cleanup
            });
          }
        }

        if (sessionsToCleanup.length > 0) {
          logger.info(`🧹 Found ${sessionsToCleanup.length} orphaned sessions to cleanup`);

          // Update orphaned sessions
          for (const session of sessionsToCleanup) {
            const endTime = new Date(new Date(session.start_time).getTime() + session.calculatedDuration * 1000);
            
            const { error: updateError } = await supabase
              .from('study_sessions')
              .update({
                end_time: endTime.toISOString(),
                duration: session.calculatedDuration,
                is_active: false,
                notes: `Auto-terminated orphaned session`
              })
              .eq('id', session.id);

            if (updateError) {
              logger.error(`Error cleaning up session ${session.id}:`, updateError);
            } else {
              logger.info(`✅ Cleaned up orphaned session ${session.id}`);
            }
          }
        }

        // Clear any persisted session state from localStorage
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.includes('session-state') || key.includes('global-session')) {
              localStorage.removeItem(key);
              logger.info('🧹 Cleared persisted session:', key);
            }
          });
        } catch (error) {
          logger.warn('Could not clear localStorage:', error);
        }

      } catch (error) {
        logger.error('Error during session cleanup:', error);
      }
    };

    // Run cleanup immediately
    cleanupOrphanedSessions();
  }, [user]);
};
