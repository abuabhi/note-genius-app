
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useSessionPersistence } from './useSessionPersistence';

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
  const recoveryAttempted = useRef(false);

  // Session recovery on app load
  useEffect(() => {
    const attemptRecovery = async () => {
      if (!user || recoveryAttempted.current) {
        console.log('🔄 [SESSION RECOVERY] Skipping recovery - user:', !!user, 'already attempted:', recoveryAttempted.current);
        return;
      }
      
      recoveryAttempted.current = true;
      console.log('🔄 [SESSION RECOVERY] Attempting to recover active session for user:', user.id);
      
      try {
        const recoveredSession = await recoverActiveSession();
        
        if (recoveredSession) {
          console.log('✅ [SESSION RECOVERY] Session recovered:', {
            sessionId: recoveredSession.sessionId,
            title: recoveredSession.title,
            elapsedSeconds: recoveredSession.elapsedSeconds,
            activityType: recoveredSession.activityType
          });
          
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
          
          console.log('🔄 [SESSION RECOVERY] Setting session state:', recoveredState);
          setSessionState(recoveredState);
          
          toast.success('Study session resumed');
        } else {
          console.log('ℹ️ [SESSION RECOVERY] No active session found');
          setSessionState(prev => ({ ...prev, isRecovering: false }));
        }
      } catch (error) {
        console.error('❌ [SESSION RECOVERY] Error during recovery:', error);
        setSessionState(prev => ({ ...prev, isRecovering: false }));
      }
    };

    // Add a small delay to ensure auth is fully loaded
    const timeout = setTimeout(attemptRecovery, 100);
    return () => clearTimeout(timeout);
  }, [user, recoverActiveSession]);

  // Persist session state changes
  useEffect(() => {
    if (sessionState.isActive && sessionState.currentSessionId && !sessionState.isRecovering) {
      saveSessionState({
        sessionId: sessionState.currentSessionId,
        startTime: sessionState.startTime?.toISOString() || new Date().toISOString(),
        title: sessionState.currentTitle || 'Study Session',
        subject: sessionState.currentSubject || undefined,
        activityType: sessionState.activityType || 'general',
        studyPlanId: sessionState.studyPlanId || undefined,
        elapsedSeconds: sessionState.elapsedSeconds
      });
    } else if (!sessionState.isActive) {
      clearPersistedSession();
    }
  }, [sessionState.isActive, sessionState.currentSessionId, sessionState.elapsedSeconds, sessionState.isRecovering, saveSessionState, clearPersistedSession]);

  // Timer logic
  useEffect(() => {
    if (sessionState.isActive && !sessionState.isPaused && !sessionState.isRecovering) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionState.isActive, sessionState.isPaused, sessionState.isRecovering]);

  // Inactivity detection
  useEffect(() => {
    if (sessionState.isActive && !sessionState.isPaused && !sessionState.isRecovering) {
      const checkInactivity = () => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeSinceLastActivity > fiveMinutes) {
          setSessionState(prev => ({ ...prev, showInactivityWarning: true }));
          
          setTimeout(() => {
            if (sessionState.showInactivityWarning) {
              endSession('Auto-ended due to inactivity');
            }
          }, 2 * 60 * 1000);
        }
      };

      inactivityTimerRef.current = setInterval(checkInactivity, 30000);
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, [sessionState.isActive, sessionState.isPaused, sessionState.isRecovering]);

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

      setSessionState({
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
      });

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

      setSessionState({
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
      });

      clearPersistedSession();
      toast.success(`Session ended (${Math.round(duration / 60)} minutes)`);

    } catch (error) {
      console.error('❌ [UNIFIED SESSION] Error ending session:', error);
      toast.error('Failed to end session properly');
    }
  };

  const togglePause = () => {
    setSessionState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
    
    if (!sessionState.isPaused) {
      toast.info('Session paused');
    } else {
      toast.info('Session resumed');
      trackActivity();
    }
  };

  const dismissInactivityWarning = () => {
    setSessionState(prev => ({ ...prev, showInactivityWarning: false }));
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
