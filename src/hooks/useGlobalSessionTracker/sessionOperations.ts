
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityType, GlobalSessionState, isStudyRoute } from './types';
import { persistSession, restoreSession, clearPersistedSession } from './sessionPersistence';
import { validateSessionDuration, validateSessionState } from './sessionValidation';
import { logger } from '@/config/environment';

export const useSessionOperations = (
  user: any,
  sessionState: GlobalSessionState,
  setSessionState: React.Dispatch<React.SetStateAction<GlobalSessionState>>,
  getCurrentActivityType: () => ActivityType
) => {
  const queryClient = useQueryClient();

  // Update session with activity data
  const updateSessionActivity = useCallback(async (activityData: any) => {
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
      logger.error('Error updating session activity:', error);
    }
  }, [sessionState.sessionId, sessionState.isActive]);

  // Start session with enhanced validation and session reuse
  const startSession = useCallback(async () => {
    if (!user) {
      logger.warn('Cannot start session: no user');
      return;
    }

    // Check if we should even start a session based on current route
    const currentPath = window.location.pathname;
    if (!isStudyRoute(currentPath)) {
      logger.info(`Not starting session - current path "${currentPath}" is not a study route`);
      return;
    }

    // If we already have an active session and it's valid, just update activity type
    if (sessionState.isActive && sessionState.sessionId && validateSessionState(sessionState)) {
      logger.info('Valid session already exists, updating activity type only');
      updateActivityType();
      return;
    }

    try {
      // Check for any existing active sessions in database - look for very recent ones first
      const { data: activeSessions, error: checkError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(3);

      if (checkError) {
        logger.warn('Warning checking for active sessions:', checkError);
      }

      // If we have recent active sessions, try to resume the most recent one
      if (activeSessions && activeSessions.length > 0) {
        const existingSession = activeSessions[0];
        const sessionAge = Date.now() - new Date(existingSession.start_time).getTime();
        const twoHours = 2 * 60 * 60 * 1000; // Extended to 2 hours for better continuity
        
        if (sessionAge < twoHours) {
          logger.info('🔄 Resuming existing session instead of creating new one');
          const resumedState = {
            sessionId: existingSession.id,
            isActive: true,
            startTime: new Date(existingSession.start_time).getTime(),
            elapsedSeconds: Math.floor(sessionAge / 1000),
            currentActivity: getCurrentActivityType(),
            isPaused: false
          };
          
          setSessionState(resumedState);
          persistSession(resumedState);
          
          // Update the activity type for the resumed session
          await updateActivityType();
          return;
        } else {
          // Session is too old, clean it up
          logger.info('Cleaning up old session');
          const duration = Math.min(
            Math.floor(sessionAge / 1000),
            4 * 60 * 60 // Cap at 4 hours
          );
          
          await supabase
            .from('study_sessions')
            .update({
              end_time: new Date().toISOString(),
              duration: validateSessionDuration(duration),
              is_active: false,
              notes: 'Auto-terminated due to age'
            })
            .eq('id', existingSession.id);
        }
      }

      // Create new session only if no recent session exists
      const activityType = getCurrentActivityType();
      const now = new Date();

      const sessionData = {
        user_id: user.id,
        title: `Study Session - ${activityType.replace('_', ' ')}`,
        subject: activityType === 'general' ? 'Multi-Activity Study' : activityType.replace('_', ' '),
        start_time: now.toISOString(),
        is_active: true,
        activity_type: activityType,
        auto_created: true,
        duration: null,
        end_time: null
      };

      logger.info('🚀 Creating new session for study route:', currentPath);
      const { data, error } = await supabase
        .from('study_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      const newSessionState = {
        sessionId: data.id,
        isActive: true,
        startTime: now.getTime(),
        elapsedSeconds: 0,
        currentActivity: activityType,
        isPaused: false
      };

      setSessionState(newSessionState);
      persistSession(newSessionState);

      logger.info('✅ New session created:', data.id);
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['timezone-aware-analytics'] });

    } catch (error) {
      logger.error('Error starting session:', error);
    }
  }, [user, sessionState, getCurrentActivityType, queryClient]);

  // End session with validation
  const endSession = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.startTime) {
      logger.info('Cannot end session: no active session');
      return;
    }

    try {
      const endTime = new Date();
      const startTime = new Date(sessionState.startTime);
      
      const actualDurationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      const validatedDuration = validateSessionDuration(actualDurationSeconds);

      logger.info('🛑 Ending session...', {
        sessionId: sessionState.sessionId,
        actualDuration: actualDurationSeconds,
        validatedDuration: validatedDuration,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: validatedDuration,
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

      logger.info('✅ Session ended successfully');
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['timezone-aware-analytics'] });

    } catch (error) {
      logger.error('Error ending session:', error);
    }
  }, [sessionState.sessionId, sessionState.startTime, queryClient]);

  // Update activity type with route validation and throttling
  const updateActivityType = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.isActive) return;

    const currentPath = window.location.pathname;
    if (!isStudyRoute(currentPath)) {
      logger.info('Not updating activity type - not on study route');
      return;
    }

    const newActivityType = getCurrentActivityType();
    if (newActivityType === sessionState.currentActivity) return;

    try {
      logger.info('🔄 Updating activity type to:', newActivityType);
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

      logger.info('✅ Activity type updated to:', newActivityType);

    } catch (error) {
      logger.error('Error updating activity type:', error);
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
    logger.info(sessionState.isPaused ? '▶️ Session resumed' : '⏸️ Session paused');
  }, [sessionState]);

  return {
    updateSessionActivity,
    startSession,
    endSession,
    updateActivityType,
    togglePause
  };
};
