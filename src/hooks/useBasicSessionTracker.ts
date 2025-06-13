
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'general' | 'flashcard_study' | 'note_review' | 'quiz_taking';

const STUDY_ROUTES = ['/flashcards', '/notes', '/quiz', '/study'];

const isStudyRoute = (pathname: string): boolean => {
  return STUDY_ROUTES.some(route => pathname.startsWith(route));
};

const getActivityType = (pathname: string): ActivityType => {
  if (pathname.startsWith('/flashcards')) return 'flashcard_study';
  if (pathname.startsWith('/notes')) return 'note_review';
  if (pathname.startsWith('/quiz')) return 'quiz_taking';
  return 'general';
};

export const useBasicSessionTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Core session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityType>('general');
  
  // Use refs for stable values in timer calculations
  const pausedTimeRef = useRef(0);
  const lastPauseStartRef = useRef<Date | null>(null);
  
  // Derived state
  const isOnStudyPage = isStudyRoute(location.pathname);
  const isActive = !!sessionId;

  console.log('🎯 Session State:', {
    pathname: location.pathname,
    isOnStudyPage,
    isActive,
    isPaused,
    isManuallyPaused,
    sessionId,
    elapsedSeconds,
    currentActivity,
    user: !!user
  });

  // Timer - runs every second when active and not paused
  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      let elapsed: number;
      
      if (isPaused && lastPauseStartRef.current) {
        // If paused, calculate time up to when pause started
        elapsed = Math.floor((lastPauseStartRef.current.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
      } else {
        // If not paused, calculate current elapsed time minus all previous paused time
        elapsed = Math.floor((now.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
      }
      
      setElapsedSeconds(Math.max(0, elapsed));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, isPaused]); // Removed totalPausedTime from dependencies

  // Start session
  const startSession = useCallback(async () => {
    if (!user) {
      console.log('❌ Cannot start session - no user');
      return;
    }
    
    try {
      const now = new Date();
      const activityType = getActivityType(location.pathname);
      
      console.log('🚀 Starting new session with activity:', activityType);
      
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          title: `Study Session - ${activityType.replace('_', ' ')}`,
          subject: activityType.replace('_', ' '),
          start_time: now.toISOString(),
          is_active: true,
          activity_type: activityType,
          auto_created: true
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setStartTime(now);
      setElapsedSeconds(0);
      setIsPaused(false);
      setIsManuallyPaused(false);
      pausedTimeRef.current = 0;
      lastPauseStartRef.current = null;
      setCurrentActivity(activityType);
      
      console.log('✅ Session started:', data.id);
    } catch (error) {
      console.error('❌ Failed to start session:', error);
    }
  }, [user, location.pathname]);

  // End session
  const endSession = useCallback(async () => {
    if (!sessionId || !startTime) return;

    try {
      const endTime = new Date();
      let finalDuration: number;
      
      if (isPaused && lastPauseStartRef.current) {
        // If currently paused, calculate duration up to pause start
        finalDuration = Math.floor((lastPauseStartRef.current.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
      } else {
        // If not paused, calculate total duration minus paused time
        finalDuration = Math.floor((endTime.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
      }

      console.log('🛑 Ending session:', sessionId, 'Duration:', finalDuration);

      await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: Math.max(finalDuration, 1),
          is_active: false
        })
        .eq('id', sessionId);

      // Reset all state
      setSessionId(null);
      setStartTime(null);
      setElapsedSeconds(0);
      setIsPaused(false);
      setIsManuallyPaused(false);
      pausedTimeRef.current = 0;
      lastPauseStartRef.current = null;
      setCurrentActivity('general');
      
      console.log('✅ Session ended');
    } catch (error) {
      console.error('❌ Failed to end session:', error);
    }
  }, [sessionId, startTime, isPaused]);

  // Update activity type
  const updateActivityType = useCallback(async () => {
    if (!sessionId) return;
    
    const newActivity = getActivityType(location.pathname);
    if (newActivity === currentActivity) return;

    try {
      await supabase
        .from('study_sessions')
        .update({
          activity_type: newActivity,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      setCurrentActivity(newActivity);
      console.log('✅ Updated activity type to:', newActivity);
    } catch (error) {
      console.error('❌ Failed to update activity type:', error);
    }
  }, [sessionId, currentActivity, location.pathname]);

  // Navigation effect
  useEffect(() => {
    console.log('📍 Navigation Effect:', {
      pathname: location.pathname,
      isOnStudyPage,
      isActive,
      isPaused,
      isManuallyPaused,
      user: !!user
    });

    if (!user) return;

    // SIMPLE RULE: If on study page and no session -> start one
    if (isOnStudyPage && !isActive) {
      console.log('🚀 On study page without session - starting');
      startSession();
      return;
    }

    // SIMPLE RULE: If on study page and paused session (but NOT manually paused) -> resume
    if (isOnStudyPage && isActive && isPaused && !isManuallyPaused) {
      console.log('▶️ On study page with auto-paused session - resuming');
      
      // Add the pause duration to total paused time
      if (lastPauseStartRef.current) {
        const pauseDuration = Date.now() - lastPauseStartRef.current.getTime();
        pausedTimeRef.current += pauseDuration;
        lastPauseStartRef.current = null;
      }
      setIsPaused(false);
      return;
    }

    // SIMPLE RULE: If NOT on study page and active session (and not manually paused) -> auto pause
    if (!isOnStudyPage && isActive && !isPaused && !isManuallyPaused) {
      console.log('⏸️ Left study page - auto-pausing session');
      lastPauseStartRef.current = new Date();
      setIsPaused(true);
      return;
    }

    // Update activity type if on study page with active session
    if (isOnStudyPage && isActive) {
      updateActivityType();
    }
  }, [location.pathname, user, isOnStudyPage, isActive, isPaused, isManuallyPaused, startSession, updateActivityType]);

  const togglePause = useCallback(() => {
    if (!isActive) return;
    
    console.log('⏯️ Manual toggle pause:', !isPaused);
    
    if (isPaused) {
      // Resume - add paused time to total and clear pause state
      if (lastPauseStartRef.current) {
        const pauseDuration = Date.now() - lastPauseStartRef.current.getTime();
        pausedTimeRef.current += pauseDuration;
        lastPauseStartRef.current = null;
      }
      setIsPaused(false);
      setIsManuallyPaused(false);
    } else {
      // Pause - record when we paused and mark as manual
      lastPauseStartRef.current = new Date();
      setIsPaused(true);
      setIsManuallyPaused(true);
    }
  }, [isPaused, isActive]);

  const recordActivity = useCallback(() => {
    if (isOnStudyPage && isPaused && !isManuallyPaused) {
      // Resume if we're on study page and currently auto-paused (not manually paused)
      if (lastPauseStartRef.current) {
        const pauseDuration = Date.now() - lastPauseStartRef.current.getTime();
        pausedTimeRef.current += pauseDuration;
        lastPauseStartRef.current = null;
      }
      setIsPaused(false);
    }
  }, [isOnStudyPage, isPaused, isManuallyPaused]);

  const updateSessionActivity = useCallback(async (activityData: any) => {
    if (!sessionId || !isActive) return;
    
    try {
      await supabase
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
        .eq('id', sessionId);
    } catch (error) {
      console.error('❌ Failed to update session activity:', error);
    }
  }, [sessionId, isActive]);

  return {
    // State
    sessionId,
    isActive,
    startTime,
    elapsedSeconds,
    currentActivity,
    isPaused,
    isOnStudyPage,
    
    // Actions
    startSession,
    endSession,
    togglePause,
    recordActivity,
    updateSessionActivity
  };
};
