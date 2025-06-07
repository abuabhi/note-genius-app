import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface SessionState {
  isTracking: boolean;
  currentSessionId: string | null;
  activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general' | null;
  startTime: Date | null;
  elapsedSeconds: number;
  lastActivity: Date | null;
}

const MAX_SESSION_DURATION = 3 * 60 * 60; // 3 hours in seconds
const INACTIVITY_TIMEOUT = 15 * 60; // 15 minutes in seconds
const AUTO_SAVE_INTERVAL = 30 * 1000; // 30 seconds

export const useImprovedSessionTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sessionState, setSessionState] = useState<SessionState>({
    isTracking: false,
    currentSessionId: null,
    activityType: null,
    startTime: null,
    elapsedSeconds: 0,
    lastActivity: null
  });

  const saveIntervalRef = useRef<NodeJS.Timeout>();
  const elapsedIntervalRef = useRef<NodeJS.Timeout>();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();
  const isPageVisible = useRef(true);
  const isUnloading = useRef(false);

  // Page visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = isPageVisible.current;
      isPageVisible.current = !document.hidden;
      
      console.log('Page visibility changed:', isPageVisible.current ? 'visible' : 'hidden');
      
      if (!wasVisible && isPageVisible.current && sessionState.isTracking) {
        // Page became visible again - resume tracking
        recordActivity();
      } else if (wasVisible && !isPageVisible.current && sessionState.isTracking) {
        // Page became hidden - pause tracking (but don't end session immediately)
        console.log('Page hidden, pausing activity tracking');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionState.isTracking]);

  // Record user activity
  const recordActivity = useCallback(() => {
    if (!sessionState.isTracking) return;
    
    const now = new Date();
    setSessionState(prev => ({
      ...prev,
      lastActivity: now
    }));

    // Reset inactivity timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    inactivityTimeoutRef.current = setTimeout(() => {
      console.log('Session ended due to inactivity');
      endSession();
    }, INACTIVITY_TIMEOUT * 1000);
  }, [sessionState.isTracking]);

  // Clean up existing active sessions for this user
  const cleanupExistingActiveSessions = useCallback(async () => {
    if (!user) return;

    try {
      const { data: activeSessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (activeSessions && activeSessions.length > 0) {
        console.log('Cleaning up', activeSessions.length, 'active sessions');
        
        const updatePromises = activeSessions.map(session => {
          const endTime = new Date();
          const duration = Math.min(
            Math.floor((endTime.getTime() - new Date(session.start_time).getTime()) / 1000),
            MAX_SESSION_DURATION
          );
          
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
      }
    } catch (error) {
      console.error('Error cleaning up active sessions:', error);
    }
  }, [user]);

  // Auto-save session data
  const autoSaveSession = useCallback(async () => {
    if (!sessionState.currentSessionId || !sessionState.startTime) return;

    const now = new Date();
    const duration = Math.min(
      Math.floor((now.getTime() - sessionState.startTime.getTime()) / 1000),
      MAX_SESSION_DURATION
    );
    
    try {
      await supabase
        .from('study_sessions')
        .update({
          duration,
          updated_at: now.toISOString()
        })
        .eq('id', sessionState.currentSessionId);
      
      console.log('Auto-saved session:', sessionState.currentSessionId, 'Duration:', duration);
      
      // End session if it's reached max duration
      if (duration >= MAX_SESSION_DURATION) {
        console.log('Session reached max duration, ending automatically');
        endSession();
      }
    } catch (error) {
      console.error('Failed to auto-save session:', error);
    }
  }, [sessionState.currentSessionId, sessionState.startTime]);

  // Start tracking a new session
  const startSession = useCallback(async (
    activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general',
    title?: string,
    subject?: string
  ) => {
    if (!user || sessionState.isTracking) {
      console.log('Cannot start session: no user or already tracking');
      return null;
    }

    try {
      // Clean up any existing active sessions first
      await cleanupExistingActiveSessions();

      const sessionTitle = title || `${activityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Session`;
      const startTime = new Date();

      console.log('Starting new session:', sessionTitle, 'Type:', activityType);

      const { data: newSession, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          title: sessionTitle,
          subject: subject || 'General',
          activity_type: activityType,
          start_time: startTime.toISOString(),
          is_active: true,
          auto_created: true
        })
        .select()
        .single();

      if (error) throw error;

      setSessionState({
        isTracking: true,
        currentSessionId: newSession.id,
        activityType,
        startTime,
        elapsedSeconds: 0,
        lastActivity: startTime
      });

      // Start intervals
      saveIntervalRef.current = setInterval(autoSaveSession, AUTO_SAVE_INTERVAL);
      
      elapsedIntervalRef.current = setInterval(() => {
        if (isPageVisible.current) {
          setSessionState(prev => {
            if (!prev.startTime) return prev;
            const elapsed = Math.floor((Date.now() - prev.startTime.getTime()) / 1000);
            return { ...prev, elapsedSeconds: Math.min(elapsed, MAX_SESSION_DURATION) };
          });
        }
      }, 1000);

      // Set initial activity timeout
      recordActivity();

      console.log('Started session successfully:', newSession.id);
      return newSession.id;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }, [user, sessionState.isTracking, cleanupExistingActiveSessions, autoSaveSession, recordActivity]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!sessionState.currentSessionId || !sessionState.startTime) {
      console.log('No active session to end');
      return;
    }

    const endTime = new Date();
    const duration = Math.min(
      Math.floor((endTime.getTime() - sessionState.startTime.getTime()) / 1000),
      MAX_SESSION_DURATION
    );

    console.log('Ending session:', sessionState.currentSessionId, 'Duration:', duration);

    try {
      await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration,
          is_active: false,
          updated_at: endTime.toISOString()
        })
        .eq('id', sessionState.currentSessionId);

      // Clear all intervals and timeouts
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);

      setSessionState({
        isTracking: false,
        currentSessionId: null,
        activityType: null,
        startTime: null,
        elapsedSeconds: 0,
        lastActivity: null
      });

      // Invalidate related queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: ['consolidated-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['unified-study-stats'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-study-sessions'] });

      console.log('Session ended successfully');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [sessionState.currentSessionId, sessionState.startTime, queryClient]);

  // Update session with activity data
  const updateSessionActivity = useCallback(async (activityData: {
    cards_reviewed?: number;
    cards_correct?: number;
    quiz_score?: number;
    quiz_total_questions?: number;
    notes_created?: number;
    notes_reviewed?: number;
  }) => {
    if (!sessionState.currentSessionId) return;

    recordActivity(); // Record activity when updating

    try {
      await supabase
        .from('study_sessions')
        .update({
          ...activityData,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.currentSessionId);
      
      console.log('Updated session activity:', activityData);
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, [sessionState.currentSessionId, recordActivity]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      isUnloading.current = true;
      if (sessionState.currentSessionId && sessionState.startTime) {
        const duration = Math.min(
          Math.floor((Date.now() - sessionState.startTime.getTime()) / 1000),
          MAX_SESSION_DURATION
        );
        
        const sessionData = {
          end_time: new Date().toISOString(),
          duration,
          is_active: false,
          updated_at: new Date().toISOString()
        };
        
        // Use fetch with keepalive for reliable data sending during page unload
        fetch(`https://zuhcmwujzfddmafozubd.supabase.co/rest/v1/study_sessions?id=eq.${sessionState.currentSessionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw'
          },
          body: JSON.stringify(sessionData),
          keepalive: true
        }).catch(error => console.error('Failed to save session on unload:', error));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionState.currentSessionId, sessionState.startTime]);

  // Cleanup on mount to ensure clean state
  useEffect(() => {
    if (user) {
      cleanupExistingActiveSessions();
    }
  }, [user, cleanupExistingActiveSessions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    };
  }, []);

  return {
    ...sessionState,
    startSession,
    endSession,
    updateSessionActivity,
    recordActivity,
    autoSaveSession
  };
};
