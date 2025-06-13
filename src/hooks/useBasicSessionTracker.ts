import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'general' | 'flashcard_study' | 'note_review' | 'quiz_taking';

const STUDY_ROUTES = ['/flashcards', '/notes', '/quiz', '/study'];
const PERIODIC_SAVE_INTERVAL = 30000; // 30 seconds
const AUTO_TIMEOUT_MINUTES = 30;
const WARNING_TIMEOUT_MINUTES = 25;

const isStudyRoute = (pathname: string): boolean => {
  return STUDY_ROUTES.some(route => pathname.startsWith(route));
};

const getActivityType = (pathname: string): ActivityType => {
  if (pathname.startsWith('/flashcards')) return 'flashcard_study';
  if (pathname.startsWith('/notes')) return 'note_review';
  if (pathname.startsWith('/quiz')) return 'quiz_taking';
  return 'general';
};

// Add instance tracking to prevent multiple hook instances
let hookInstanceCount = 0;

export const useBasicSessionTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Track hook instances for debugging
  useEffect(() => {
    hookInstanceCount++;
    console.log('🎯 [BASIC SESSION] Hook instance created. Total instances:', hookInstanceCount);
    
    return () => {
      hookInstanceCount--;
      console.log('🎯 [BASIC SESSION] Hook instance destroyed. Remaining instances:', hookInstanceCount);
    };
  }, []);
  
  // Core session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityType>('general');
  const [isEnding, setIsEnding] = useState(false);
  const [finalElapsedTime, setFinalElapsedTime] = useState<number | null>(null); // NEW: Store final time
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  // Use refs for stable values in timer calculations
  const pausedTimeRef = useRef(0);
  const lastPauseStartRef = useRef<Date | null>(null);
  const periodicSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutWarningRef = useRef<NodeJS.Timeout | null>(null);
  const autoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Derived state
  const isOnStudyPage = isStudyRoute(location.pathname);
  const isActive = !!sessionId;

  console.log('🎯 [BASIC SESSION] Session State:', {
    pathname: location.pathname,
    isOnStudyPage,
    isActive,
    isPaused,
    isManuallyPaused,
    sessionId,
    elapsedSeconds,
    finalElapsedTime,
    currentActivity,
    user: !!user,
    hookInstances: hookInstanceCount,
    isEnding,
    showTimeoutWarning
  });

  // Timer - runs every second when active and not paused and not ending
  useEffect(() => {
    if (!isActive || !startTime || isEnding) return; // Don't update timer if ending

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
  }, [isActive, startTime, isPaused, isEnding]);

  // Periodic save to database
  const saveSessionProgress = useCallback(async () => {
    if (!sessionId || !startTime || !user) return;

    try {
      const now = new Date();
      let currentDuration: number;
      
      if (isPaused && lastPauseStartRef.current) {
        currentDuration = Math.floor((lastPauseStartRef.current.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
      } else {
        currentDuration = Math.floor((now.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
      }

      console.log('💾 [BASIC SESSION] Periodic save - Duration:', currentDuration, 'seconds, Paused:', isPaused);

      await supabase
        .from('study_sessions')
        .update({
          duration: Math.max(currentDuration, 1),
          updated_at: now.toISOString(),
          // Keep session active during periodic saves
          is_active: true
        })
        .eq('id', sessionId);

      console.log('✅ [BASIC SESSION] Periodic save completed for session:', sessionId);
    } catch (error) {
      console.error('❌ [BASIC SESSION] Failed to save session progress:', error);
    }
  }, [sessionId, startTime, isPaused, user]);

  // Setup periodic saves
  useEffect(() => {
    if (!isActive) {
      // Clear periodic save interval when session is not active
      if (periodicSaveIntervalRef.current) {
        clearInterval(periodicSaveIntervalRef.current);
        periodicSaveIntervalRef.current = null;
      }
      return;
    }

    // Start periodic saves
    periodicSaveIntervalRef.current = setInterval(saveSessionProgress, PERIODIC_SAVE_INTERVAL);

    return () => {
      if (periodicSaveIntervalRef.current) {
        clearInterval(periodicSaveIntervalRef.current);
        periodicSaveIntervalRef.current = null;
      }
    };
  }, [isActive, saveSessionProgress]);

  // Setup auto-timeout when paused
  useEffect(() => {
    // Clear existing timeouts
    if (timeoutWarningRef.current) {
      clearTimeout(timeoutWarningRef.current);
      timeoutWarningRef.current = null;
    }
    if (autoTimeoutRef.current) {
      clearTimeout(autoTimeoutRef.current);
      autoTimeoutRef.current = null;
    }
    setShowTimeoutWarning(false);

    if (!isActive || !isPaused) return;

    console.log('⏰ [BASIC SESSION] Setting up auto-timeout timers');

    // Set warning timeout
    timeoutWarningRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      console.log('⚠️ [BASIC SESSION] Showing timeout warning');
    }, WARNING_TIMEOUT_MINUTES * 60 * 1000);

    // Set auto-timeout
    autoTimeoutRef.current = setTimeout(async () => {
      console.log('🔔 [BASIC SESSION] Auto-timeout triggered, ending session');
      await endSessionDueToTimeout();
    }, AUTO_TIMEOUT_MINUTES * 60 * 1000);

    return () => {
      if (timeoutWarningRef.current) {
        clearTimeout(timeoutWarningRef.current);
        timeoutWarningRef.current = null;
      }
      if (autoTimeoutRef.current) {
        clearTimeout(autoTimeoutRef.current);
        autoTimeoutRef.current = null;
      }
    };
  }, [isActive, isPaused]);

  // Auto-timeout session end
  const endSessionDueToTimeout = useCallback(async () => {
    if (!sessionId || !startTime) return;

    try {
      console.log('⏰ [BASIC SESSION] Auto-ending session due to timeout');
      
      const endTime = new Date();
      let finalDuration: number;
      
      if (lastPauseStartRef.current) {
        finalDuration = Math.floor((lastPauseStartRef.current.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
      } else {
        finalDuration = Math.floor((endTime.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
      }

      await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: Math.max(finalDuration, 1),
          is_active: false,
          notes: 'Session auto-ended due to inactivity'
        })
        .eq('id', sessionId);

      // Clear session state
      clearSessionState();
      
      console.log('✅ [BASIC SESSION] Session auto-ended successfully');
    } catch (error) {
      console.error('❌ [BASIC SESSION] Failed to auto-end session:', error);
    }
  }, [sessionId, startTime]);

  // Start session
  const startSession = useCallback(async () => {
    if (!user) {
      console.log('❌ [BASIC SESSION] Cannot start session - no user');
      return;
    }
    
    try {
      const now = new Date();
      const activityType = getActivityType(location.pathname);
      
      console.log('🚀 [BASIC SESSION] Starting new session with activity:', activityType);
      
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
      setIsEnding(false);
      setFinalElapsedTime(null);
      setShowTimeoutWarning(false);
      pausedTimeRef.current = 0;
      lastPauseStartRef.current = null;
      setCurrentActivity(activityType);
      
      console.log('✅ [BASIC SESSION] Session started:', data.id);
    } catch (error) {
      console.error('❌ [BASIC SESSION] Failed to start session:', error);
    }
  }, [user, location.pathname]);

  // Save session to database without clearing state
  const saveSession = useCallback(async () => {
    if (!sessionId || !startTime) {
      console.log('❌ [BASIC SESSION] Cannot save session - no active session');
      return null;
    }

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

      console.log('💾 [BASIC SESSION] Saving session:', sessionId, 'Duration:', finalDuration, 'seconds');

      await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: Math.max(finalDuration, 1),
          is_active: false
        })
        .eq('id', sessionId);

      console.log('✅ [BASIC SESSION] Session saved successfully:', sessionId);
      return finalDuration;
    } catch (error) {
      console.error('❌ [BASIC SESSION] Failed to save session:', error);
      return null;
    }
  }, [sessionId, startTime, isPaused]);

  // Clear session state
  const clearSessionState = useCallback(() => {
    console.log('🧹 [BASIC SESSION] Clearing session state');
    
    // Clear all timeouts
    if (periodicSaveIntervalRef.current) {
      clearInterval(periodicSaveIntervalRef.current);
      periodicSaveIntervalRef.current = null;
    }
    if (timeoutWarningRef.current) {
      clearTimeout(timeoutWarningRef.current);
      timeoutWarningRef.current = null;
    }
    if (autoTimeoutRef.current) {
      clearTimeout(autoTimeoutRef.current);
      autoTimeoutRef.current = null;
    }
    
    setSessionId(null);
    setStartTime(null);
    setElapsedSeconds(0);
    setIsPaused(false);
    setIsManuallyPaused(false);
    setIsEnding(false);
    setFinalElapsedTime(null);
    setShowTimeoutWarning(false);
    pausedTimeRef.current = 0;
    lastPauseStartRef.current = null;
    setCurrentActivity('general');
  }, []);

  // End session - now captures final time before setting ending state
  const endSession = useCallback(async () => {
    if (!sessionId || !startTime) {
      console.log('❌ [BASIC SESSION] Cannot end session - no active session');
      return;
    }

    console.log('🛑 [BASIC SESSION] Starting session end process');
    
    // Calculate and store final elapsed time BEFORE setting ending state
    let finalTime: number;
    if (isPaused && lastPauseStartRef.current) {
      finalTime = Math.floor((lastPauseStartRef.current.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
    } else {
      const now = new Date();
      finalTime = Math.floor((now.getTime() - startTime.getTime() - pausedTimeRef.current) / 1000);
    }
    
    // Store the final elapsed time and set ending state
    setFinalElapsedTime(finalTime);
    setIsEnding(true);

    // Save the session
    await saveSession();

    // Return a function that can be called to clear state later
    return clearSessionState;
  }, [sessionId, startTime, isPaused, saveSession, clearSessionState]);

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
      console.log('✅ [BASIC SESSION] Updated activity type to:', newActivity);
    } catch (error) {
      console.error('❌ [BASIC SESSION] Failed to update activity type:', error);
    }
  }, [sessionId, currentActivity, location.pathname]);

  // Navigation effect
  useEffect(() => {
    console.log('📍 [BASIC SESSION] Navigation Effect:', {
      pathname: location.pathname,
      isOnStudyPage,
      isActive,
      isPaused,
      isManuallyPaused,
      isEnding,
      user: !!user
    });

    if (!user || isEnding) return; // Don't navigate if ending

    // SIMPLE RULE: If on study page and no session -> start one
    if (isOnStudyPage && !isActive) {
      console.log('🚀 [BASIC SESSION] On study page without session - starting');
      startSession();
      return;
    }

    // SIMPLE RULE: If on study page and paused session (but NOT manually paused) -> resume
    if (isOnStudyPage && isActive && isPaused && !isManuallyPaused) {
      console.log('▶️ [BASIC SESSION] On study page with auto-paused session - resuming');
      
      // Add the pause duration to total paused time
      if (lastPauseStartRef.current) {
        const pauseDuration = Date.now() - lastPauseStartRef.current.getTime();
        pausedTimeRef.current += pauseDuration;
        lastPauseStartRef.current = null;
      }
      setIsPaused(false);
      setShowTimeoutWarning(false);
      return;
    }

    // SIMPLE RULE: If NOT on study page and active session (and not manually paused) -> auto pause
    if (!isOnStudyPage && isActive && !isPaused && !isManuallyPaused) {
      console.log('⏸️ [BASIC SESSION] Left study page - auto-pausing session');
      lastPauseStartRef.current = new Date();
      setIsPaused(true);
      return;
    }

    // Update activity type if on study page with active session
    if (isOnStudyPage && isActive) {
      updateActivityType();
    }
  }, [location.pathname, user, isOnStudyPage, isActive, isPaused, isManuallyPaused, isEnding, startSession, updateActivityType]);

  const togglePause = useCallback(() => {
    if (!isActive || isEnding) return;
    
    console.log('⏯️ [BASIC SESSION] Manual toggle pause:', !isPaused);
    
    if (isPaused) {
      // Resume - add paused time to total and clear pause state
      if (lastPauseStartRef.current) {
        const pauseDuration = Date.now() - lastPauseStartRef.current.getTime();
        pausedTimeRef.current += pauseDuration;
        lastPauseStartRef.current = null;
      }
      setIsPaused(false);
      setIsManuallyPaused(false);
      setShowTimeoutWarning(false);
    } else {
      // Pause - record when we paused and mark as manual
      lastPauseStartRef.current = new Date();
      setIsPaused(true);
      setIsManuallyPaused(true);
    }
  }, [isPaused, isActive, isEnding]);

  const recordActivity = useCallback(() => {
    console.log('📝 [BASIC SESSION] Recording activity - current state:', { isOnStudyPage, isPaused, isManuallyPaused, isEnding });
    
    if (isEnding) return; // Don't record activity if ending
    
    if (isOnStudyPage && isPaused && !isManuallyPaused) {
      // Resume if we're on study page and currently auto-paused (not manually paused)
      if (lastPauseStartRef.current) {
        const pauseDuration = Date.now() - lastPauseStartRef.current.getTime();
        pausedTimeRef.current += pauseDuration;
        lastPauseStartRef.current = null;
      }
      setIsPaused(false);
      setShowTimeoutWarning(false);
      console.log('▶️ [BASIC SESSION] Auto-resumed session due to activity');
    }
  }, [isOnStudyPage, isPaused, isManuallyPaused, isEnding]);

  const updateSessionActivity = useCallback(async (activityData: any) => {
    if (!sessionId || !isActive || isEnding) {
      console.log('❌ [BASIC SESSION] Cannot update activity - no active session or ending');
      return;
    }
    
    try {
      console.log('📊 [BASIC SESSION] Updating session activity:', sessionId, activityData);
      
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
        
      console.log('✅ [BASIC SESSION] Session activity updated successfully');
    } catch (error) {
      console.error('❌ [BASIC SESSION] Failed to update session activity:', error);
    }
  }, [sessionId, isActive, isEnding]);

  const dismissTimeoutWarning = useCallback(() => {
    setShowTimeoutWarning(false);
  }, []);

  // Return final elapsed time if ending, otherwise current elapsed time
  const displayElapsedSeconds = finalElapsedTime !== null ? finalElapsedTime : elapsedSeconds;

  return {
    // State
    sessionId,
    isActive,
    startTime,
    elapsedSeconds: displayElapsedSeconds, // Use display time
    currentActivity,
    isPaused,
    isOnStudyPage,
    isEnding,
    showTimeoutWarning,
    
    // Actions
    startSession,
    endSession, // Returns a cleanup function
    togglePause,
    recordActivity,
    updateSessionActivity,
    dismissTimeoutWarning
  };
};
