
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useSessionPersistence } from './useSessionPersistence';
import { useTabVisibility } from '@/hooks/performance/useTabVisibility';
import { DEBUG_CONFIG } from '@/config/debug';

export interface SessionData {
  title: string;
  subject?: string;
  activityType?: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'study_plan' | 'general';
  studyPlanId?: string;
  flashcardSetId?: string;
  notes?: string;
}

export interface UnifiedSessionState {
  isActive: boolean;
  currentSessionId: string | null;
  startTime: Date | null;
  elapsedSeconds: number;
  isPaused: boolean;
  activityType: string | null;
  currentTitle: string | null;
  currentSubject: string | null;
  studyPlanId: string | null;
  showInactivityWarning: boolean;
  isRecovering: boolean;
}

export const useUnifiedSessionTracker = () => {
  const { user } = useAuth();
  const { 
    saveSessionState, 
    clearPersistedSession, 
    recoverActiveSession 
  } = useSessionPersistence();
  
  // Cross-component sync via window event
  const EVENT_NAME = 'unified-session:state';
  const broadcastState = (state: UnifiedSessionState) => {
    window.dispatchEvent(new CustomEvent<UnifiedSessionState>(EVENT_NAME, { detail: state }));
  };
  
  const [sessionState, setSessionState] = useState<UnifiedSessionState>({
    isActive: false,
    currentSessionId: null,
    startTime: null,
    elapsedSeconds: 0,
    isPaused: false,
    activityType: null,
    currentTitle: null,
    currentSubject: null,
    studyPlanId: null,
    showInactivityWarning: false,
    isRecovering: true
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());
  const recoveryAttempts = useRef(0);
  const maxRecoveryAttempts = 3;
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track tab visibility to implement away behavior
  const isTabVisible = useTabVisibility();

  // Away handling
  const tabHiddenAtRef = useRef<number | null>(null);
  const awayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoPausedRef = useRef<boolean>(false);

  // Listen for external session state updates (from other hook instances)
  useEffect(() => {
    const onExternalUpdate = (e: Event) => {
      const ce = e as CustomEvent<UnifiedSessionState>;
      if (ce.detail) {
        setSessionState(ce.detail);
      }
    };
    window.addEventListener(EVENT_NAME as any, onExternalUpdate as EventListener);
    return () => window.removeEventListener(EVENT_NAME as any, onExternalUpdate as EventListener);
  }, []);

  // Configurable thresholds via settings (localStorage)
  const getAwayThresholds = () => {
    const pause = Number(localStorage.getItem('settings.awayPauseMinutes')) || 30;
    const end = Number(localStorage.getItem('settings.awayEndMinutes')) || 60;
    return {
      pauseMinutes: Math.max(1, pause),
      endMinutes: Math.max(1, end),
    };
  };

  // Session recovery with retry logic
  useEffect(() => {
    const attemptRecoveryWithRetry = async (attemptNumber = 1) => {
      if (!user) {
        if (DEBUG_CONFIG.SESSION_LOGGING) {
          console.log('🔄 [SESSION RECOVERY] No user available, resetting recovery state');
        }
        recoveryAttempts.current = 0;
        setSessionState(prev => ({ ...prev, isRecovering: false }));
        return;
      }

      if (attemptNumber > maxRecoveryAttempts) {
        if (DEBUG_CONFIG.SESSION_LOGGING) {
          console.log('🔄 [SESSION RECOVERY] Max recovery attempts reached, giving up');
        }
        setSessionState(prev => ({ ...prev, isRecovering: false }));
        return;
      }
      
      if (DEBUG_CONFIG.SESSION_LOGGING) {
        console.log(`🔄 [SESSION RECOVERY] Attempt ${attemptNumber}/${maxRecoveryAttempts} for user:`, user.id);
      }
      
      try {
        const recoveredSession = await recoverActiveSession();
        
        if (recoveredSession) {
          if (DEBUG_CONFIG.SESSION_LOGGING) {
            console.log('✅ [SESSION RECOVERY] Session recovered:', {
              sessionId: recoveredSession.sessionId,
              title: recoveredSession.title,
              elapsedSeconds: recoveredSession.elapsedSeconds,
              activityType: recoveredSession.activityType
            });
          }
          
          const recoveredState = {
            isActive: true,
            currentSessionId: recoveredSession.sessionId,
            startTime: new Date(recoveredSession.startTime),
            elapsedSeconds: recoveredSession.elapsedSeconds,
            isPaused: false,
            activityType: recoveredSession.activityType,
            currentTitle: recoveredSession.title,
            currentSubject: recoveredSession.subject || null,
            studyPlanId: recoveredSession.studyPlanId || null,
            showInactivityWarning: false,
            isRecovering: false
          };
          
          setSessionState(recoveredState);
          broadcastState(recoveredState);
          recoveryAttempts.current = 0;
          toast.success('Study session resumed');
        } else {
          if (DEBUG_CONFIG.SESSION_LOGGING) {
            console.log('ℹ️ [SESSION RECOVERY] No active session found');
          }
          setSessionState(prev => ({ ...prev, isRecovering: false }));
          recoveryAttempts.current = 0;
        }
      } catch (error) {
        if (DEBUG_CONFIG.SESSION_LOGGING) {
          console.error(`❌ [SESSION RECOVERY] Error during recovery attempt ${attemptNumber}:`, error);
        }
        
        if (attemptNumber < maxRecoveryAttempts) {
          const retryDelay = Math.min(1000 * Math.pow(2, attemptNumber - 1), 5000); // Exponential backoff, max 5s
          if (DEBUG_CONFIG.SESSION_LOGGING) {
            console.log(`🔄 [SESSION RECOVERY] Retrying in ${retryDelay}ms...`);
          }
          
          recoveryTimeoutRef.current = setTimeout(() => {
            attemptRecoveryWithRetry(attemptNumber + 1);
          }, retryDelay);
        } else {
          setSessionState(prev => ({ ...prev, isRecovering: false }));
          recoveryAttempts.current = 0;
        }
      }
    };

    // Reset recovery attempts when user changes
    if (user) {
      recoveryAttempts.current = 0;
      // Increase initial delay to 500ms to ensure auth is fully loaded
      const timeout = setTimeout(() => attemptRecoveryWithRetry(), 500);
      return () => {
        clearTimeout(timeout);
        if (recoveryTimeoutRef.current) {
          clearTimeout(recoveryTimeoutRef.current);
          recoveryTimeoutRef.current = null;
        }
      };
    }
  }, [user, recoverActiveSession]);

  // Persist session state changes (debounced to reduce frequent updates)
  useEffect(() => {
    if (sessionState.isActive && sessionState.currentSessionId && !sessionState.isRecovering) {
      // Only persist every 10 seconds to reduce frequent writes
      if (sessionState.elapsedSeconds % 10 === 0 || sessionState.elapsedSeconds === 1) {
        saveSessionState({
          sessionId: sessionState.currentSessionId,
          startTime: sessionState.startTime?.toISOString() || new Date().toISOString(),
          title: sessionState.currentTitle || 'Study Session',
          subject: sessionState.currentSubject || undefined,
          activityType: sessionState.activityType || 'general',
          studyPlanId: sessionState.studyPlanId || undefined,
          elapsedSeconds: sessionState.elapsedSeconds
        });
      }
    } else if (!sessionState.isActive) {
      clearPersistedSession();
    }
  }, [sessionState.isActive, sessionState.currentSessionId, sessionState.elapsedSeconds, sessionState.isRecovering, saveSessionState, clearPersistedSession]);

  // Consolidated timer logic with functional updates to prevent race conditions
  useEffect(() => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only start timer if session is active, not paused, and not recovering
    if (sessionState.isActive && !sessionState.isPaused && !sessionState.isRecovering) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => {
          // Double-check state before updating to prevent conflicts
          if (!prev.isActive || prev.isPaused || prev.isRecovering) {
            return prev;
          }
          
          const updatedState = {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 1
          };
          
          // Broadcast state change with debounce-like behavior (only every 5 seconds to reduce flickering)
          if (updatedState.elapsedSeconds % 5 === 0) {
            // Use requestAnimationFrame to prevent rapid state broadcasts
            requestAnimationFrame(() => broadcastState(updatedState));
          }
          
          return updatedState;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionState.isActive, sessionState.isPaused, sessionState.isRecovering]);

  // Inactivity detection (visible tab only)
  useEffect(() => {
    if (!isTabVisible) return;
    if (sessionState.isActive && !sessionState.isRecovering) {
      const checkInactivity = () => {
        const { pauseMinutes, endMinutes } = getAwayThresholds();
        const inactivityMs = Date.now() - lastActivityRef.current.getTime();

        if (inactivityMs >= endMinutes * 60 * 1000) {
          endSession('Auto-ended due to inactivity');
        } else if (!sessionState.isPaused && inactivityMs >= pauseMinutes * 60 * 1000) {
          setSessionState(prev => prev.isPaused ? prev : ({ ...prev, isPaused: true, showInactivityWarning: true }));
          toast.info('Session paused due to inactivity');
        }
      };

      inactivityTimerRef.current = setInterval(checkInactivity, 30000);
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [sessionState.isActive, sessionState.isRecovering, isTabVisible, sessionState.isPaused]);

  // Away handling: pause after pauseMinutes and end after endMinutes when tab is hidden
  useEffect(() => {
    if (!sessionState.isActive || sessionState.isRecovering) return;

    if (isTabVisible) {
      // Reset away tracking when user returns
      tabHiddenAtRef.current = null;
      autoPausedRef.current = false;
      if (awayIntervalRef.current) {
        clearInterval(awayIntervalRef.current);
        awayIntervalRef.current = null;
      }
      return;
    }

    // Start tracking when tab becomes hidden
    tabHiddenAtRef.current = Date.now();
    autoPausedRef.current = false;

    awayIntervalRef.current = setInterval(() => {
      const { pauseMinutes, endMinutes } = getAwayThresholds();
      const hiddenAt = tabHiddenAtRef.current || Date.now();
      const awayMs = Date.now() - hiddenAt;

      if (awayMs >= endMinutes * 60 * 1000) {
        // End session once and cleanup
        if (awayIntervalRef.current) {
          clearInterval(awayIntervalRef.current);
          awayIntervalRef.current = null;
        }
        endSession(`Auto-ended after being away for ${endMinutes} minutes`);
      } else if (!autoPausedRef.current && awayMs >= pauseMinutes * 60 * 1000) {
        autoPausedRef.current = true;
        setSessionState(prev => prev.isPaused ? prev : ({ ...prev, isPaused: true }));
        toast.info('Session paused due to being away');
      }
    }, 30000);

    return () => {
      if (awayIntervalRef.current) {
        clearInterval(awayIntervalRef.current);
        awayIntervalRef.current = null;
      }
    };
  }, [isTabVisible, sessionState.isActive, sessionState.isRecovering]);

  // Activity tracking
  const trackActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    if (sessionState.showInactivityWarning) {
      setSessionState(prev => ({ ...prev, showInactivityWarning: false }));
    }
  }, [sessionState.showInactivityWarning]);

  // Track mouse movement and keyboard activity
  useEffect(() => {
    if (sessionState.isActive && !sessionState.isRecovering) {
      const handleActivity = () => trackActivity();
      
      document.addEventListener('mousemove', handleActivity);
      document.addEventListener('keypress', handleActivity);
      document.addEventListener('click', handleActivity);
      
      return () => {
        document.removeEventListener('mousemove', handleActivity);
        document.removeEventListener('keypress', handleActivity);
        document.removeEventListener('click', handleActivity);
      };
    }
  }, [sessionState.isActive, sessionState.isRecovering, trackActivity]);

  const startSession = async (sessionData: SessionData): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('🚀 [UNIFIED SESSION] Starting new session:', sessionData);

      // End any existing active session first
      if (sessionState.isActive && sessionState.currentSessionId) {
        await endSession('Starting new session');
      }

      const now = new Date();
      const newSession = {
        user_id: user.id,
        title: sessionData.title,
        subject: sessionData.subject || null,
        activity_type: sessionData.activityType || 'general',
        study_plan_id: sessionData.studyPlanId || null,
        flashcard_set_id: sessionData.flashcardSetId || null,
        notes: sessionData.notes || null,
        start_time: now.toISOString(),
        is_active: true,
        auto_created: false,
        duration: null,
        end_time: null
      };

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(newSession)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ [UNIFIED SESSION] Session created successfully:', data.id);

      const newState: UnifiedSessionState = {
        isActive: true,
        currentSessionId: data.id,
        startTime: now,
        elapsedSeconds: 0,
        isPaused: false,
        activityType: sessionData.activityType || 'general',
        currentTitle: sessionData.title,
        currentSubject: sessionData.subject || null,
        studyPlanId: sessionData.studyPlanId || null,
        showInactivityWarning: false,
        isRecovering: false
      };

      setSessionState(newState);
      broadcastState(newState);

      toast.success(`Session started: ${sessionData.title}`);
      return data.id;

    } catch (error) {
      console.error('❌ [UNIFIED SESSION] Error starting session:', error);
      toast.error('Failed to start session');
      throw error;
    }
  };

  const endSession = async (reason = 'Manual session end'): Promise<void> => {
    if (!sessionState.isActive || !sessionState.currentSessionId) {
      console.log('⚠️ [UNIFIED SESSION] No active session to end');
      return;
    }

    try {
      console.log('🛑 [UNIFIED SESSION] Ending session:', sessionState.currentSessionId, 'Reason:', reason);

      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - (sessionState.startTime?.getTime() || Date.now())) / 1000);

      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: duration,
          is_active: false,
          notes: sessionState.currentTitle ? `${sessionState.currentTitle} - ${reason}` : reason
        })
        .eq('id', sessionState.currentSessionId);

      if (error) throw error;

      console.log('✅ [UNIFIED SESSION] Session ended successfully. Duration:', Math.round(duration / 60), 'minutes');

      // Clear all timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }

      const endedState: UnifiedSessionState = {
        isActive: false,
        currentSessionId: null,
        startTime: null,
        elapsedSeconds: 0,
        isPaused: false,
        activityType: null,
        currentTitle: null,
        currentSubject: null,
        studyPlanId: null,
        showInactivityWarning: false,
        isRecovering: false
      };

      setSessionState(endedState);
      broadcastState(endedState);

      clearPersistedSession();
      toast.success(`Session ended (${Math.round(duration / 60)} minutes)`);

    } catch (error) {
      console.error('❌ [UNIFIED SESSION] Error ending session:', error);
      toast.error('Failed to end session properly');
    }
  };

  const togglePause = () => {
    setSessionState(prev => {
      const newPausedState = !prev.isPaused;
      const updatedState = { ...prev, isPaused: newPausedState };
      
      // Use setTimeout to prevent race condition with immediate state broadcast
      setTimeout(() => broadcastState(updatedState), 0);
      
      // Show appropriate toast based on new state
      if (newPausedState) {
        toast.info('Session paused');
      } else {
        toast.info('Session resumed');
        trackActivity();
      }
      
      return updatedState;
    });
  };

  const dismissInactivityWarning = () => {
    setSessionState(prev => {
      const next = { ...prev, showInactivityWarning: false };
      broadcastState(next);
      return next;
    });
    trackActivity();
  };

  return {
    // State
    isActive: sessionState.isActive,
    currentSessionId: sessionState.currentSessionId,
    startTime: sessionState.startTime,
    elapsedSeconds: sessionState.elapsedSeconds,
    isPaused: sessionState.isPaused,
    activityType: sessionState.activityType,
    currentTitle: sessionState.currentTitle,
    currentSubject: sessionState.currentSubject,
    studyPlanId: sessionState.studyPlanId,
    showInactivityWarning: sessionState.showInactivityWarning,
    isRecovering: sessionState.isRecovering,
    
    // Actions
    startSession,
    endSession,
    togglePause,
    dismissInactivityWarning,
    trackActivity
  };
};
