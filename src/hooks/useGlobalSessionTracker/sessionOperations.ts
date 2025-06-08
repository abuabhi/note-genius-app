
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityType, GlobalSessionState, ActivityData } from './types';
import { persistSession, restoreSession, clearPersistedSession } from './sessionPersistence';

export const useSessionOperations = (
  user: any,
  sessionState: GlobalSessionState,
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>,
  getCurrentActivityType: () => ActivityType
) => {
  const queryClient = useQueryClient();

  // Update session with activity data
  const updateSessionActivity = useCallback(async (activityData: ActivityData) => {
    if (!sessionState.sessionId || !sessionState.isActive) return;

    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({
          cards_reviewed: activityData.cards_reviewed || 0,
          cards_correct: activityData.cards_correct || 0,
          quiz_score: activityData.quiz_score || 0,
          quiz_total_questions: activityData.quiz_total_questions || 0,
          notes_created: activityData.notes_created || 0,
          notes_reviewed: activityData.notes_reviewed || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }, [sessionState.sessionId, sessionState.isActive]);

  // Restore or start session with persistence support
  const startSession = useCallback(async () => {
    if (!user) {
      console.log('❌ Cannot start session: no user');
      return;
    }

    // First, try to restore existing session from localStorage
    const restoredSession = restoreSession();
    if (restoredSession && restoredSession.sessionId) {
      console.log('🔄 Attempting to restore existing session:', restoredSession.sessionId);
      
      // Verify the session still exists in database and is active
      const { data: existingSession, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('id', restoredSession.sessionId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!error && existingSession) {
        console.log('✅ Restored existing session from localStorage:', restoredSession.sessionId);
        setSessionState(prev => ({
          ...prev,
          ...restoredSession,
          isActive: true
        }));
        return;
      } else {
        console.log('⚠️ Stored session no longer valid, clearing');
        clearPersistedSession();
      }
    }
    
    // Check if there's already an active session to prevent duplicates
    if (sessionState.isActive && sessionState.sessionId) {
      console.log('ℹ️ Session already active, updating activity type only');
      updateActivityType();
      return;
    }

    try {
      // Check for any existing active sessions in database
      const { data: activeSessions, error: checkError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(1);

      if (checkError) {
        console.warn('Warning checking for active sessions:', checkError);
      }

      if (activeSessions && activeSessions.length > 0) {
        const existingSession = activeSessions[0];
        console.log('🔄 Found existing active session, continuing it:', existingSession.id);
        
        const startTime = new Date(existingSession.start_time);
        const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
        
        const restoredState = {
          sessionId: existingSession.id,
          isActive: true,
          startTime: startTime,
          elapsedSeconds: elapsedSeconds,
          currentActivity: existingSession.activity_type as ActivityType,
          isPaused: false
        };
        
        setSessionState(restoredState);
        persistSession(restoredState);
        return;
      }

      // Only create new session if no active session exists
      const activityType = getCurrentActivityType();
      const now = new Date();

      const sessionData = {
        user_id: user.id,
        title: `Study Session - ${activityType}`,
        subject: activityType === 'general' ? 'Multi-Activity Study' : activityType.replace('_', ' '),
        start_time: now.toISOString(),
        is_active: true,
        activity_type: activityType,
        auto_created: true,
        duration: null,
        end_time: null
      };

      console.log('🚀 Creating new session...');
      const { data, error } = await supabase
        .from('study_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      const newSessionState = {
        sessionId: data.id,
        isActive: true,
        startTime: now,
        elapsedSeconds: 0,
        currentActivity: activityType,
        isPaused: false
      };

      setSessionState(newSessionState);
      persistSession(newSessionState);

      console.log('✅ New session created:', data.id);
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['timezone-aware-analytics'] });

    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [user, sessionState.isActive, sessionState.sessionId, getCurrentActivityType, queryClient]);

  // End the current session with proper cleanup
  const endSession = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.startTime) {
      console.log('❌ Cannot end session: no active session');
      return;
    }

    try {
      const endTime = new Date();
      const startTime = new Date(sessionState.startTime);
      
      const actualDurationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      const maxDuration = 4 * 60 * 60; // 4 hours
      const minDuration = 60; // 1 minute minimum
      
      let finalDuration = actualDurationSeconds;
      if (actualDurationSeconds > maxDuration) {
        finalDuration = Math.min(maxDuration, 60 * 60);
        console.log(`⚠️ Session duration capped: ${actualDurationSeconds}s -> ${finalDuration}s`);
      } else if (actualDurationSeconds < minDuration) {
        finalDuration = minDuration;
      }

      console.log('🛑 Ending session...', {
        sessionId: sessionState.sessionId,
        actualDuration: actualDurationSeconds,
        finalDuration: finalDuration,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: finalDuration,
          is_active: false,
          updated_at: endTime.toISOString()
        })
        .eq('id', sessionState.sessionId);

      if (error) throw error;

      setSessionState({
        sessionId: null,
        isActive: false,
        startTime: null,
        elapsedSeconds: 0,
        currentActivity: null,
        isPaused: false
      });

      clearPersistedSession();

      console.log('✅ Session ended successfully');
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['timezone-aware-analytics'] });

    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [sessionState.sessionId, sessionState.startTime, queryClient]);

  // Update session activity type when switching between study pages
  const updateActivityType = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.isActive) return;

    const newActivityType = getCurrentActivityType();
    if (newActivityType === sessionState.currentActivity) return;

    try {
      console.log('🔄 Updating activity type to:', newActivityType);
      const { error } = await supabase
        .from('study_sessions')
        .update({
          activity_type: newActivityType,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.sessionId);

      if (error) throw error;

      const updatedState = {
        ...sessionState,
        currentActivity: newActivityType
      };
      
      setSessionState(prev => ({
        ...prev,
        currentActivity: newActivityType
      }));

      persistSession(updatedState);

      console.log('✅ Activity type updated to:', newActivityType);

    } catch (error) {
      console.error('Error updating activity type:', error);
    }
  }, [sessionState, getCurrentActivityType]);

  // Pause/resume session
  const togglePause = useCallback(() => {
    const newState = {
      ...sessionState,
      isPaused: !sessionState.isPaused
    };
    setSessionState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
    persistSession(newState);
    console.log(sessionState.isPaused ? '▶️ Session resumed' : '⏸️ Session paused');
  }, [sessionState]);

  return {
    updateSessionActivity,
    startSession,
    endSession,
    updateActivityType,
    togglePause
  };
};
