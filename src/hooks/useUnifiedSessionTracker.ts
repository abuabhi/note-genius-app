
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

interface UnifiedSessionState {
  isActive: boolean;
  sessionId: string | null;
  activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general' | null;
  startTime: Date | null;
  elapsedSeconds: number;
  lastActivity: Date | null;
  isPaused: boolean;
  isOnStudyPage: boolean;
  showTimeoutWarning: boolean;
  currentSubject?: string;
  currentTitle?: string;
}

const INACTIVITY_TIMEOUT = 10 * 60; // 10 minutes
const AUTO_SAVE_INTERVAL = 30 * 1000; // 30 seconds
const TIMEOUT_WARNING_TIME = 5 * 60; // 5 minutes before timeout

const STUDY_ROUTES = [
  '/flashcards/study',
  '/notes/study',
  '/quiz',
  '/flashcards/create',
  '/notes/create'
];

export const useUnifiedSessionTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();
  
  const [sessionState, setSessionState] = useState<UnifiedSessionState>({
    isActive: false,
    sessionId: null,
    activityType: null,
    startTime: null,
    elapsedSeconds: 0,
    lastActivity: null,
    isPaused: false,
    isOnStudyPage: false,
    showTimeoutWarning: false
  });

  const saveIntervalRef = useRef<NodeJS.Timeout>();
  const elapsedIntervalRef = useRef<NodeJS.Timeout>();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();
  const timeoutWarningRef = useRef<NodeJS.Timeout>();

  // Check if current route is a study page
  const checkIsStudyPage = useCallback(() => {
    return STUDY_ROUTES.some(route => location.pathname.includes(route));
  }, [location.pathname]);

  // Update study page status
  useEffect(() => {
    const isOnStudyPage = checkIsStudyPage();
    setSessionState(prev => ({ ...prev, isOnStudyPage }));
    
    // Auto-start session if on study page and not already active
    if (isOnStudyPage && !sessionState.isActive && user) {
      console.log('🎯 Auto-starting session on study page');
      startSession('general', 'Study Session');
    }
  }, [location.pathname, checkIsStudyPage, sessionState.isActive, user]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, pause timer
        setSessionState(prev => ({ ...prev, isPaused: true }));
      } else {
        // Page is visible, resume timer and record activity
        setSessionState(prev => ({ ...prev, isPaused: false }));
        recordActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Record user activity
  const recordActivity = useCallback(() => {
    if (!sessionState.isActive) return;
    
    const now = new Date();
    setSessionState(prev => ({
      ...prev,
      lastActivity: now,
      showTimeoutWarning: false
    }));

    // Clear existing timeouts
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (timeoutWarningRef.current) {
      clearTimeout(timeoutWarningRef.current);
    }
    
    // Set timeout warning
    timeoutWarningRef.current = setTimeout(() => {
      setSessionState(prev => ({ ...prev, showTimeoutWarning: true }));
    }, (INACTIVITY_TIMEOUT - TIMEOUT_WARNING_TIME) * 1000);
    
    // Set auto-end timeout
    inactivityTimeoutRef.current = setTimeout(() => {
      console.log('🕒 Session ended due to inactivity');
      endSession('Auto-ended due to inactivity');
    }, INACTIVITY_TIMEOUT * 1000);
  }, [sessionState.isActive]);

  // Auto-save session data
  const autoSaveSession = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.startTime || sessionState.isPaused) return;

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
  }, [sessionState.sessionId, sessionState.startTime, sessionState.isPaused]);

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

      console.log('🎯 Starting unified study session:', title, 'Type:', activityType);

      const { data: newSession, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          title,
          subject: subject || 'General',
          activity_type: activityType,
          start_time: startTime.toISOString(),
          is_active: true,
          auto_created: false
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
        lastActivity: startTime,
        isPaused: false,
        isOnStudyPage: checkIsStudyPage(),
        showTimeoutWarning: false,
        currentSubject: subject,
        currentTitle: title
      });

      // Start intervals
      saveIntervalRef.current = setInterval(autoSaveSession, AUTO_SAVE_INTERVAL);
      
      elapsedIntervalRef.current = setInterval(() => {
        setSessionState(prev => {
          if (!prev.startTime || prev.isPaused) return prev;
          const elapsed = Math.floor((Date.now() - prev.startTime.getTime()) / 1000);
          return { ...prev, elapsedSeconds: elapsed };
        });
      }, 1000);

      // Set initial activity timeout
      recordActivity();

      console.log('✅ Started unified session successfully:', newSession.id);
      return newSession.id;
    } catch (error) {
      console.error('Failed to start session:', error);
      return null;
    }
  }, [user, sessionState.isActive, autoSaveSession, recordActivity, checkIsStudyPage]);

  // End the current session
  const endSession = useCallback(async (reason?: string) => {
    if (!sessionState.sessionId || !sessionState.startTime) {
      console.log('No active session to end');
      return;
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - sessionState.startTime.getTime()) / 1000);

    console.log('🏁 Ending unified session:', sessionState.sessionId, 'Duration:', duration);

    try {
      await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration,
          is_active: false,
          notes: reason || 'Session ended manually',
          updated_at: endTime.toISOString()
        })
        .eq('id', sessionState.sessionId);

      // Clear all intervals and timeouts
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (timeoutWarningRef.current) clearTimeout(timeoutWarningRef.current);

      setSessionState({
        isActive: false,
        sessionId: null,
        activityType: null,
        startTime: null,
        elapsedSeconds: 0,
        lastActivity: null,
        isPaused: false,
        isOnStudyPage: checkIsStudyPage(),
        showTimeoutWarning: false,
        currentSubject: undefined,
        currentTitle: undefined
      });

      // Invalidate related queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: ['session-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['clean-session-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['ultra-simple-analytics'] });

      console.log('✅ Session ended successfully');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [sessionState.sessionId, sessionState.startTime, queryClient, checkIsStudyPage]);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    setSessionState(prev => {
      const newPaused = !prev.isPaused;
      if (!newPaused) {
        // Resuming, record activity
        recordActivity();
      }
      return { ...prev, isPaused: newPaused };
    });
  }, [recordActivity]);

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

  // Dismiss timeout warning
  const dismissTimeoutWarning = useCallback(() => {
    setSessionState(prev => ({ ...prev, showTimeoutWarning: false }));
    recordActivity(); // Reset timeout when user dismisses warning
  }, [recordActivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (timeoutWarningRef.current) clearTimeout(timeoutWarningRef.current);
    };
  }, []);

  // Handle app closure
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionState.isActive && sessionState.sessionId) {
        // Save session state before closing
        navigator.sendBeacon('/api/save-session', JSON.stringify({
          sessionId: sessionState.sessionId,
          endTime: new Date().toISOString()
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionState.isActive, sessionState.sessionId]);

  return {
    ...sessionState,
    startSession,
    endSession,
    togglePause,
    updateSessionActivity,
    recordActivity,
    dismissTimeoutWarning
  };
};
