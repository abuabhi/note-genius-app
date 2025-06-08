
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityType, GlobalSessionState, ActivityData } from './types';

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

  // Start a new session with better duplicate prevention
  const startSession = useCallback(async () => {
    if (!user) {
      console.log('❌ Cannot start session: no user');
      return;
    }
    
    // Check if there's already an active session to prevent duplicates
    if (sessionState.isActive && sessionState.sessionId) {
      console.log('❌ Cannot start session: session already active locally');
      return;
    }

    try {
      // First, end any existing active sessions for this user (cleanup)
      const { error: cleanupError } = await supabase
        .from('study_sessions')
        .update({
          is_active: false,
          end_time: new Date().toISOString(),
          duration: 1800, // Default 30 minutes for abandoned sessions
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (cleanupError) {
        console.warn('Warning cleaning up existing sessions:', cleanupError);
      }

      // Now create a new session
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

      console.log('🚀 Starting new session with cleanup...');
      const { data, error } = await supabase
        .from('study_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      setSessionState({
        sessionId: data.id,
        isActive: true,
        startTime: now,
        elapsedSeconds: 0,
        currentActivity: activityType,
        isPaused: false
      });

      console.log('✅ New session started:', data.id);
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['timezone-aware-analytics'] });

    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [user, sessionState.isActive, sessionState.sessionId, getCurrentActivityType, queryClient]);

  // End the current session with proper duration calculation
  const endSession = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.startTime) {
      console.log('❌ Cannot end session: no active session');
      return;
    }

    try {
      const endTime = new Date();
      const startTime = new Date(sessionState.startTime);
      
      // Calculate realistic duration (cap at 4 hours but allow shorter sessions)
      const actualDurationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      const maxDuration = 4 * 60 * 60; // 4 hours
      const minDuration = 60; // 1 minute minimum
      
      // Use actual duration if reasonable, otherwise cap it
      let finalDuration = actualDurationSeconds;
      if (actualDurationSeconds > maxDuration) {
        finalDuration = Math.min(maxDuration, 60 * 60); // Cap at 1 hour for likely abandoned sessions
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

      setSessionState(prev => ({
        ...prev,
        currentActivity: newActivityType
      }));

      console.log('✅ Activity type updated to:', newActivityType);

    } catch (error) {
      console.error('Error updating activity type:', error);
    }
  }, [sessionState.sessionId, sessionState.isActive, sessionState.currentActivity, getCurrentActivityType]);

  // Pause/resume session
  const togglePause = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
    console.log(sessionState.isPaused ? '▶️ Session resumed' : '⏸️ Session paused');
  }, [sessionState.isPaused]);

  return {
    updateSessionActivity,
    startSession,
    endSession,
    updateActivityType,
    togglePause
  };
};
