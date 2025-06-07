import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface AutoSessionState {
  isTracking: boolean;
  currentSessionId: string | null;
  activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general' | null;
  startTime: Date | null;
  elapsedSeconds: number;
}

export const useAutoSessionTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sessionState, setSessionState] = useState<AutoSessionState>({
    isTracking: false,
    currentSessionId: null,
    activityType: null,
    startTime: null,
    elapsedSeconds: 0
  });

  const saveIntervalRef = useRef<NodeJS.Timeout>();
  const elapsedIntervalRef = useRef<NodeJS.Timeout>();

  // Auto-save session data every 30 seconds
  const autoSaveSession = useCallback(async () => {
    if (!sessionState.currentSessionId || !sessionState.startTime) return;

    const duration = Math.floor((Date.now() - sessionState.startTime.getTime()) / 1000);
    
    try {
      await supabase
        .from('study_sessions')
        .update({
          duration,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.currentSessionId);
      
      console.log('Auto-saved session:', sessionState.currentSessionId, 'Duration:', duration);
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
    if (!user || sessionState.isTracking) return null;

    try {
      const sessionTitle = title || `${activityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Session`;
      const startTime = new Date();

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
        elapsedSeconds: 0
      });

      // Start auto-save interval
      saveIntervalRef.current = setInterval(autoSaveSession, 30000);
      
      // Start elapsed time counter
      elapsedIntervalRef.current = setInterval(() => {
        setSessionState(prev => ({
          ...prev,
          elapsedSeconds: prev.startTime ? Math.floor((Date.now() - prev.startTime.getTime()) / 1000) : 0
        }));
      }, 1000);

      console.log('Started auto session:', newSession.id, 'Type:', activityType);
      return newSession.id;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }, [user, sessionState.isTracking, autoSaveSession]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!sessionState.currentSessionId || !sessionState.startTime) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - sessionState.startTime.getTime()) / 1000);

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

      // Clear intervals
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);

      setSessionState({
        isTracking: false,
        currentSessionId: null,
        activityType: null,
        startTime: null,
        elapsedSeconds: 0
      });

      // Invalidate related queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['unified-study-stats'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-study-sessions'] });

      console.log('Ended session:', sessionState.currentSessionId, 'Duration:', duration);
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

    try {
      await supabase
        .from('study_sessions')
        .update({
          ...activityData,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.currentSessionId);
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, [sessionState.currentSessionId]);

  // Handle page unload to save session
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionState.currentSessionId && sessionState.startTime) {
        const duration = Math.floor((Date.now() - sessionState.startTime.getTime()) / 1000);
        
        // Use sendBeacon for reliable data sending during page unload
        const sessionData = {
          end_time: new Date().toISOString(),
          duration,
          is_active: false,
          updated_at: new Date().toISOString()
        };
        
        // Use fetch with keepalive instead of accessing protected supabaseUrl
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    };
  }, []);

  return {
    ...sessionState,
    startSession,
    endSession,
    updateSessionActivity,
    autoSaveSession
  };
};
