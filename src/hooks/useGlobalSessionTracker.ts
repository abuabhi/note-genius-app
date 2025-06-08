
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

type ActivityType = 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general';

interface GlobalSessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  currentActivity: ActivityType | null;
  isPaused: boolean;
}

// Define study routes where sessions should be active
const STUDY_ROUTES = [
  '/flashcards',
  '/notes', 
  '/quiz',
  '/quizzes'
];

export const useGlobalSessionTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [sessionState, setSessionState] = useState<GlobalSessionState>({
    sessionId: null,
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
    currentActivity: null,
    isPaused: false
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());

  // Check if current route is a study route
  const isOnStudyPage = STUDY_ROUTES.some(route => location.pathname.startsWith(route));

  // Determine activity type from current route
  const getCurrentActivityType = useCallback((): ActivityType => {
    const path = location.pathname;
    if (path.startsWith('/flashcards')) return 'flashcard_study';
    if (path.startsWith('/notes')) return 'note_review';
    if (path.startsWith('/quiz')) return 'quiz_taking';
    return 'general';
  }, [location.pathname]);

  // Start a new session
  const startSession = useCallback(async () => {
    if (!user || !isOnStudyPage || sessionState.isActive) return;

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

      console.log('🚀 Global session started:', data.id);
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });

    } catch (error) {
      console.error('Error starting global session:', error);
    }
  }, [user, isOnStudyPage, sessionState.isActive, getCurrentActivityType, queryClient]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!sessionState.sessionId) return;

    try {
      const endTime = new Date();
      const duration = sessionState.startTime ? 
        Math.floor((endTime.getTime() - sessionState.startTime.getTime()) / 1000) : 0;

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

      console.log('🛑 Global session ended');
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

      console.log('🔄 Activity type updated to:', newActivityType);

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
  }, []);

  // Timer effect
  useEffect(() => {
    if (sessionState.isActive && !sessionState.isPaused && sessionState.startTime) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => ({
          ...prev,
          elapsedSeconds: Math.floor((Date.now() - prev.startTime!.getTime()) / 1000)
        }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionState.isActive, sessionState.isPaused, sessionState.startTime]);

  // Handle page navigation
  useEffect(() => {
    if (isOnStudyPage) {
      // If we're on a study page and no session is active, start one
      if (!sessionState.isActive) {
        startSession();
      } else {
        // Update activity type if session is already active
        updateActivityType();
      }
    } else {
      // If we leave study pages, end the session
      if (sessionState.isActive) {
        endSession();
      }
    }
  }, [isOnStudyPage, location.pathname, sessionState.isActive, startSession, endSession, updateActivityType]);

  // Record user activity
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Auto-pause on inactivity (5 minutes)
  useEffect(() => {
    if (!sessionState.isActive || sessionState.isPaused) return;

    const checkInactivity = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSinceActivity > fiveMinutes && !sessionState.isPaused) {
        console.log('🔄 Auto-pausing session due to inactivity');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [sessionState.isActive, sessionState.isPaused]);

  // Activity listeners
  useEffect(() => {
    if (!isOnStudyPage) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, recordActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, recordActivity);
      });
    };
  }, [recordActivity, isOnStudyPage]);

  return {
    ...sessionState,
    isOnStudyPage,
    startSession,
    endSession,
    togglePause,
    recordActivity,
    getCurrentActivityType: getCurrentActivityType()
  };
};
