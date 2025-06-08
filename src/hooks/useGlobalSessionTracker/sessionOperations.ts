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

  // Start a new session
  const startSession = useCallback(async () => {
    if (!user) {
      console.log('❌ Cannot start session: no user');
      return;
    }
    
    // Check if there's already an active session to prevent duplicates
    if (sessionState.isActive) {
      console.log('❌ Cannot start session: session already active');
      return;
    }

    // Check for existing active session in database to prevent duplicates
    try {
      const { data: existingSessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(1);

      if (existingSessions && existingSessions.length > 0) {
        const existingSession = existingSessions[0];
        console.log('📍 Found existing active session, resuming:', existingSession.id);
        
        // Type-safe activity type conversion
        const activityType = (existingSession.activity_type as ActivityType) || 'general';
        
        setSessionState({
          sessionId: existingSession.id,
          isActive: true,
          startTime: new Date(existingSession.start_time),
          elapsedSeconds: Math.floor((Date.now() - new Date(existingSession.start_time).getTime()) / 1000),
          currentActivity: activityType,
          isPaused: false
        });
        
        // Update activity type for current page
        updateActivityType();
        return;
      }
    } catch (error) {
      console.error('Error checking for existing sessions:', error);
    }

    try {
      const activityType = getCurrentActivityType();
      const now = new Date();

      const sessionData = {
        user_id: user.id,
        title: `Global Study Session`,
        subject: 'Multi-Activity Study',
        start_time: now.toISOString(),
        is_active: true,
        activity_type: activityType,
        auto_created: true
      };

      console.log('🚀 Starting new global session...');
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

      console.log('✅ Global session started:', data.id);
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });

    } catch (error) {
      console.error('Error starting global session:', error);
    }
  }, [user, sessionState.isActive, getCurrentActivityType, queryClient]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!sessionState.sessionId) return;

    try {
      const endTime = new Date();
      const duration = sessionState.startTime ? 
        Math.floor((endTime.getTime() - sessionState.startTime.getTime()) / 1000) : 0;

      console.log('🛑 Ending global session...');
      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration,
          is_active: false
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

      console.log('✅ Global session ended');
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });

    } catch (error) {
      console.error('Error ending global session:', error);
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
