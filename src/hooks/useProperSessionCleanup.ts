
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

// Only run cleanup once per day per user, not on every page load
const CLEANUP_INTERVAL_HOURS = 24;

export const useProperSessionCleanup = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const performCleanup = async () => {
      try {
        // Check if we've done cleanup recently
        const lastCleanup = localStorage.getItem(`session-cleanup-${user.id}`);
        const now = Date.now();
        
        if (lastCleanup && (now - parseInt(lastCleanup)) < CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000) {
          console.log('🧹 Skipping cleanup - already done recently');
          return;
        }

        console.log('🧹 Running controlled session cleanup for user:', user.id);

        // Only clean up truly orphaned sessions (older than 4 hours and still active)
        const fourHoursAgo = new Date();
        fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);

        const { data: orphanedSessions, error: fetchError } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .lt('start_time', fourHoursAgo.toISOString())
          .eq('auto_created', false); // Only clean up real sessions, not auto-created ones

        if (fetchError) {
          console.error('Error fetching orphaned sessions:', fetchError);
          return;
        }

        if (orphanedSessions && orphanedSessions.length > 0) {
          console.log(`🧹 Found ${orphanedSessions.length} genuinely orphaned sessions to cleanup`);

          for (const session of orphanedSessions) {
            const endTime = new Date();
            const startTime = new Date(session.start_time);
            const duration = Math.min(
              Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
              3600 // Cap at 1 hour for cleanup
            );
            
            const { error: updateError } = await supabase
              .from('study_sessions')
              .update({
                end_time: endTime.toISOString(),
                duration,
                is_active: false,
                notes: `Auto-terminated orphaned session after 4+ hours of inactivity`
              })
              .eq('id', session.id);

            if (updateError) {
              console.error(`Error cleaning up session ${session.id}:`, updateError);
            } else {
              console.log(`✅ Cleaned up orphaned session ${session.id}`);
            }
          }
        } else {
          console.log('✅ No orphaned sessions found');
        }

        // Mark cleanup as done
        localStorage.setItem(`session-cleanup-${user.id}`, now.toString());

      } catch (error) {
        console.error('Error during controlled session cleanup:', error);
      }
    };

    // Run cleanup once when component mounts
    performCleanup();
  }, [user]);
};
