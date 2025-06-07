import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const MAX_REALISTIC_DURATION = 4 * 60 * 60; // 4 hours in seconds

export const useSessionCleanup = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cleanupOrphanedSessions = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Starting comprehensive session cleanup for user:', user.id);

      // Get all sessions for analysis
      const { data: allSessions, error: fetchError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (fetchError) {
        console.error('Error fetching sessions for cleanup:', fetchError);
        return;
      }

      if (!allSessions || allSessions.length === 0) {
        console.log('No sessions found for cleanup');
        return;
      }

      console.log('Found', allSessions.length, 'sessions to analyze');

      const cleanupPromises = [];

      // 1. End stuck active sessions older than 1 hour
      const stuckActiveSessions = allSessions.filter(session => 
        session.is_active && 
        new Date(session.start_time).getTime() < Date.now() - (60 * 60 * 1000)
      );

      for (const session of stuckActiveSessions) {
        const endTime = new Date();
        const maxDuration = Math.min(
          Math.floor((endTime.getTime() - new Date(session.start_time).getTime()) / 1000),
          MAX_REALISTIC_DURATION
        );

        cleanupPromises.push(
          supabase
            .from('study_sessions')
            .update({
              end_time: endTime.toISOString(),
              duration: maxDuration,
              is_active: false,
              updated_at: endTime.toISOString()
            })
            .eq('id', session.id)
        );
      }

      console.log('Ending', stuckActiveSessions.length, 'stuck active sessions');

      // 2. Fix sessions with unrealistic durations
      const unrealisticSessions = allSessions.filter(session => 
        session.duration && session.duration > MAX_REALISTIC_DURATION
      );

      for (const session of unrealisticSessions) {
        cleanupPromises.push(
          supabase
            .from('study_sessions')
            .update({
              duration: MAX_REALISTIC_DURATION,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id)
        );
      }

      console.log('Fixing', unrealisticSessions.length, 'sessions with unrealistic durations');

      // 3. Remove duplicate sessions (same user, same start time within 1 minute)
      const duplicateSessions = [];
      const seenTimes = new Map();

      for (const session of allSessions) {
        const startTime = new Date(session.start_time).getTime();
        const timeKey = Math.floor(startTime / (60 * 1000)); // Group by minute
        
        if (seenTimes.has(timeKey)) {
          // Keep the session with more data or the newer one
          const existingSession = seenTimes.get(timeKey);
          const existingHasData = existingSession.duration || existingSession.cards_reviewed || 0;
          const currentHasData = session.duration || session.cards_reviewed || 0;
          
          if (currentHasData <= existingHasData) {
            duplicateSessions.push(session.id);
          } else {
            duplicateSessions.push(existingSession.id);
            seenTimes.set(timeKey, session);
          }
        } else {
          seenTimes.set(timeKey, session);
        }
      }

      if (duplicateSessions.length > 0) {
        console.log('Removing', duplicateSessions.length, 'duplicate sessions');
        cleanupPromises.push(
          supabase
            .from('study_sessions')
            .delete()
            .in('id', duplicateSessions)
        );
      }

      // Execute all cleanup operations
      if (cleanupPromises.length > 0) {
        await Promise.all(cleanupPromises);
        console.log('Successfully completed session cleanup');

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['consolidated-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['unified-study-stats'] });
        queryClient.invalidateQueries({ queryKey: ['enhanced-study-sessions'] });
      } else {
        console.log('No cleanup needed');
      }

      // Log final statistics
      const { data: finalSessions } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user.id)
        .not('duration', 'is', null);

      if (finalSessions) {
        const totalMinutes = finalSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
        console.log('Cleanup complete. Total study time:', totalHours, 'hours');
      }

    } catch (error) {
      console.error('Error during comprehensive session cleanup:', error);
    }
  }, [user, queryClient]);

  // Run cleanup on mount and periodically
  useEffect(() => {
    if (user) {
      cleanupOrphanedSessions();
      
      // Run cleanup every 30 minutes
      const interval = setInterval(cleanupOrphanedSessions, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, cleanupOrphanedSessions]);

  return { cleanupOrphanedSessions };
};
