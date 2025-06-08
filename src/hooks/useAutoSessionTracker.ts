
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

type ActivityType = 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general';

interface SessionState {
  isTracking: boolean;
  currentSessionId: string | null;
  activityType: ActivityType | null;
  startTime: Date | null;
  elapsedSeconds: number;
  lastActivity: Date | null;
  isPaused: boolean;
}

// Define study routes where sessions should be active
const STUDY_ROUTES = [
  '/flashcards',
  '/notes', 
  '/quiz',
  '/quizzes'
];

export const useAutoSessionTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [sessionState, setSessionState] = useState<SessionState>({
    isTracking: false,
    currentSessionId: null,
    activityType: null,
    startTime: null,
    elapsedSeconds: 0,
    lastActivity: null,
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

  // Update session with activity data
  const updateSessionActivity = useCallback(async (activityData: {
    cards_reviewed?: number;
    cards_correct?: number;
    quiz_score?: number;
    quiz_total_questions?: number;
    notes_created?: number;
    notes_reviewed?: number;
  }) => {
    if (!sessionState.currentSessionId || !sessionState.isTracking) return;

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
        .eq('id', sessionState.currentSessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }, [sessionState.currentSessionId, sessionState.isTracking]);

  // Start a new session
  const startSession = useCallback(async () => {
    if (!user || !isOnStudyPage || sessionState.isTracking) return;

    try {
      const activityType = getCurrentActivityType();
      const now = new Date();

      const sessionData = {
        user_id: user.id,
        title: `Auto Study Session`,
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
        isTracking: true,
        currentSessionId: data.id,
        activityType,
        startTime: now,
        elapsedSeconds: 0,
        lastActivity: now,
        isPaused: false
      });

      console.log('🎯 Auto session started:', data.id);
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });

    } catch (error) {
      console.error('Error starting auto session:', error);
    }
  }, [user, isOnStudyPage, sessionState.isTracking, getCurrentActivityType, queryClient]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!sessionState.currentSessionId) return;

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
        .eq('id', sessionState.currentSessionId);

      if (error) throw error;

      setSessionState({
        isTracking: false,
        currentSessionId: null,
        activityType: null,
        startTime: null,
        elapsedSeconds: 0,
        lastActivity: null,
        isPaused: false
      });

      console.log('🎯 Auto session ended');
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });

    } catch (error) {
      console.error('Error ending auto session:', error);
    }
  }, [sessionState.currentSessionId, sessionState.startTime, queryClient]);

  // Update session activity type when switching between study pages
  const updateActivityType = useCallback(async () => {
    if (!sessionState.currentSessionId || !sessionState.isTracking) return;

    const newActivityType = getCurrentActivityType();
    if (newActivityType === sessionState.activityType) return;

    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({
          activity_type: newActivityType,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.currentSessionId);

      if (error) throw error;

      setSessionState(prev => ({
        ...prev,
        activityType: newActivityType
      }));

      console.log('🎯 Activity type updated to:', newActivityType);

    } catch (error) {
      console.error('Error updating activity type:', error);
    }
  }, [sessionState.currentSessionId, sessionState.isTracking, sessionState.activityType, getCurrentActivityType]);

  // Pause/resume session
  const togglePause = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  // Record user activity
  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSessionState(prev => ({
      ...prev,
      lastActivity: new Date()
    }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (sessionState.isTracking && !sessionState.isPaused && sessionState.startTime) {
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
  }, [sessionState.isTracking, sessionState.isPaused, sessionState.startTime]);

  // Handle page navigation
  useEffect(() => {
    console.log('🎯 Auto-session tracker status:', {
      isOnStudyPage,
      currentPath: location.pathname,
      isTracking: sessionState.isTracking,
      shouldTrack: isOnStudyPage && !sessionState.isTracking
    });

    if (isOnStudyPage) {
      // If we're on a study page and no session is active, start one
      if (!sessionState.isTracking) {
        startSession();
      } else {
        // Update activity type if session is already active
        updateActivityType();
      }
    } else {
      // If we leave study pages, end the session
      if (sessionState.isTracking) {
        endSession();
      }
    }
  }, [isOnStudyPage, location.pathname, sessionState.isTracking, startSession, endSession, updateActivityType]);

  // Auto-pause on inactivity (5 minutes)
  useEffect(() => {
    if (!sessionState.isTracking || sessionState.isPaused) return;

    const checkInactivity = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSinceActivity > fiveMinutes && !sessionState.isPaused) {
        console.log('🎯 Auto-pausing session due to inactivity');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInactivity);
  }, [sessionState.isTracking, sessionState.isPaused]);

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
    updateSessionActivity,
    getCurrentActivityType: getCurrentActivityType()
  };
};
