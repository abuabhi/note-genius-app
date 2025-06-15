
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface SessionState {
  isActive: boolean;
  sessionId: string | null;
  activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general' | null;
  startTime: Date | null;
  elapsedSeconds: number;
  lastActivity: Date | null;
}

const INACTIVITY_TIMEOUT = 10 * 60; // 10 minutes
const AUTO_SAVE_INTERVAL = 30 * 1000; // 30 seconds

export const useRealSessionTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    sessionId: null,
    activityType: null,
    startTime: null,
    elapsedSeconds: 0,
    lastActivity: null
  });

  const saveIntervalRef = useRef<NodeJS.Timeout>();
  const elapsedIntervalRef = useRef<NodeJS.Timeout>();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();

  // Record user activity
  const recordActivity = useCallback(() => {
    if (!sessionState.isActive) return;
    
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
      console.log('🕒 Session ended due to 10 minutes of inactivity');
      endSession();
    }, INACTIVITY_TIMEOUT * 1000);
  }, [sessionState.isActive]);

  // Auto-save session data
  const autoSaveSession = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.startTime) return;

    const now = new Date();
    const duration = Math.floor((now.getTime() - sessionState.startTime.getTime()) / 1000);
    
    try {
      await supabase
        .from('study_sessions')
        .update({
          duration,
          updated_at: now.toISOString()
        })
        .eq('id', sessionState.sessionId);
      
      console.log('💾 Auto-saved session:', sessionState.sessionId, 'Duration:', duration);
    } catch (error) {
      console.error('Failed to auto-save session:', error);
    }
  }, [sessionState.sessionId, sessionState.startTime]);

  // Start a new study session
  const startSession = useCallback(async (
    activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general',
    title: string,
    subject?: string
  ) => {
    if (!user || sessionState.isActive) {
      console.log('Cannot start session: no user or already active');
      return null;
    }

    try {
      const startTime = new Date();

      console.log('🎯 Starting real study session:', title, 'Type:', activityType);

      const { data: newSession, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          title,
          subject: subject || 'General',
          activity_type: activityType,
          start_time: startTime.toISOString(),
          is_active: true,
          auto_created: false // Mark as real session
        })
        .select()
        .single();

      if (error) throw error;

      setSessionState({
        isActive: true,
        sessionId: newSession.id,
        activityType,
        startTime,
        elapsedSeconds: 0,
        lastActivity: startTime
      });

      // Start intervals
      saveIntervalRef.current = setInterval(autoSaveSession, AUTO_SAVE_INTERVAL);
      
      elapsedIntervalRef.current = setInterval(() => {
        setSessionState(prev => {
          if (!prev.startTime) return prev;
          const elapsed = Math.floor((Date.now() - prev.startTime.getTime()) / 1000);
          return { ...prev, elapsedSeconds: elapsed };
        });
      }, 1000);

      // Set initial activity timeout
      recordActivity();

      console.log('✅ Started real session successfully:', newSession.id);
      return newSession.id;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }, [user, sessionState.isActive, autoSaveSession, recordActivity]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.startTime) {
      console.log('No active session to end');
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - sessionState.startTime.getTime()) / 1000);

    console.log('🏁 Ending real session:', sessionState.sessionId, 'Duration:', duration);

    try {
      await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration,
          is_active: false,
          updated_at: endTime.toISOString()
        })
        .eq('id', sessionState.sessionId);

      // Clear all intervals and timeouts
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);

      setSessionState({
        isActive: false,
        sessionId: null,
        activityType: null,
        startTime: null,
        elapsedSeconds: 0,
        lastActivity: null
      });

      // Invalidate related queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: ['session-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['ultra-simple-analytics'] });

      console.log('✅ Session ended successfully');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [sessionState.sessionId, sessionState.startTime, queryClient]);

  // Update session with activity data
  const updateSessionActivity = useCallback(async (activityData: {
    cards_reviewed?: number;
    cards_correct?: number;
    quiz_score?: number;
    quiz_total_questions?: number;
    notes_created?: number;
    notes_reviewed?: number;
  }) => {
    if (!sessionState.sessionId) return;

    recordActivity(); // Record activity when updating

    try {
      await supabase
        .from('study_sessions')
        .update({
          ...activityData,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.sessionId);
      
      console.log('📊 Updated session activity:', activityData);
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, [sessionState.sessionId, recordActivity]);

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
    recordActivity
  };
};
