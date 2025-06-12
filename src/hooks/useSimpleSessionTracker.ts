
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export type ActivityType = 'general' | 'flashcard_study' | 'note_review' | 'quiz_taking';

export interface SimpleSessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  currentActivity: ActivityType | null;
  isPaused: boolean;
  isOnStudyPage: boolean;
}

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

export const useSimpleSessionTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [sessionState, setSessionState] = useState<SimpleSessionState>({
    sessionId: null,
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
    currentActivity: null,
    isPaused: false,
    isOnStudyPage: false
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPathRef = useRef<string>('');

  // Simple timer that runs when session is active
  useEffect(() => {
    if (sessionState.isActive && sessionState.startTime) {
      timerRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - sessionState.startTime!.getTime()) / 1000);
        setSessionState(prev => ({ ...prev, elapsedSeconds: elapsed }));
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
  }, [sessionState.isActive, sessionState.startTime]);

  // Handle route changes
  useEffect(() => {
    const currentPath = location.pathname;
    const isOnStudy = isStudyRoute(currentPath);
    const wasOnStudy = isStudyRoute(lastPathRef.current);
    
    console.log('Route change:', { currentPath, isOnStudy, wasOnStudy, hasSession: !!sessionState.sessionId });
    
    // Update study page status
    setSessionState(prev => ({ ...prev, isOnStudyPage: isOnStudy }));
    
    if (isOnStudy && wasOnStudy && sessionState.isActive) {
      // Moving between study pages - just update activity type
      console.log('Moving between study pages - updating activity only');
      const newActivity = getActivityType(currentPath);
      setSessionState(prev => ({ 
        ...prev, 
        currentActivity: newActivity,
        isPaused: false 
      }));
      
      // Update database
      if (sessionState.sessionId) {
        supabase
          .from('study_sessions')
          .update({ activity_type: newActivity })
          .eq('id', sessionState.sessionId)
          .then(() => console.log('Activity type updated'));
      }
      
    } else if (isOnStudy && !sessionState.isActive) {
      // Start new session
      console.log('Starting new session');
      startSession();
      
    } else if (!isOnStudy && sessionState.isActive) {
      // Pause session when leaving study pages
      console.log('Pausing session - away from study');
      setSessionState(prev => ({ ...prev, isPaused: true }));
      
    } else if (isOnStudy && sessionState.isActive && sessionState.isPaused) {
      // Resume session when returning to study
      console.log('Resuming session');
      setSessionState(prev => ({ ...prev, isPaused: false }));
    }
    
    lastPathRef.current = currentPath;
  }, [location.pathname]);

  const startSession = useCallback(async () => {
    if (!user || sessionState.isActive) return;
    
    try {
      const now = new Date();
      const activityType = getActivityType(location.pathname);
      
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

      setSessionState({
        sessionId: data.id,
        isActive: true,
        startTime: now,
        elapsedSeconds: 0,
        currentActivity: activityType,
        isPaused: false,
        isOnStudyPage: isStudyRoute(location.pathname)
      });

      console.log('Session started:', data.id);
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, [user, location.pathname, queryClient]);

  const endSession = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.startTime) return;

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - sessionState.startTime.getTime()) / 1000);

      await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: Math.max(duration, 1),
          is_active: false
        })
        .eq('id', sessionState.sessionId);

      setSessionState({
        sessionId: null,
        isActive: false,
        startTime: null,
        elapsedSeconds: 0,
        currentActivity: null,
        isPaused: false,
        isOnStudyPage: isStudyRoute(location.pathname)
      });

      console.log('Session ended');
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [sessionState.sessionId, sessionState.startTime, location.pathname, queryClient]);

  const togglePause = useCallback(() => {
    setSessionState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const updateSessionActivity = useCallback(async (activityData: any) => {
    if (!sessionState.sessionId) return;
    
    try {
      await supabase
        .from('study_sessions')
        .update(activityData)
        .eq('id', sessionState.sessionId);
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, [sessionState.sessionId]);

  const recordActivity = useCallback(() => {
    // Simple activity recording - just ensure session is not paused if on study page
    if (sessionState.isActive && sessionState.isOnStudyPage && sessionState.isPaused) {
      setSessionState(prev => ({ ...prev, isPaused: false }));
    }
  }, [sessionState.isActive, sessionState.isOnStudyPage, sessionState.isPaused]);

  return {
    // State
    sessionId: sessionState.sessionId,
    isActive: sessionState.isActive,
    startTime: sessionState.startTime,
    elapsedSeconds: sessionState.elapsedSeconds,
    currentActivity: sessionState.currentActivity,
    isPaused: sessionState.isPaused,
    isOnStudyPage: sessionState.isOnStudyPage,
    
    // Actions
    startSession,
    endSession,
    togglePause,
    recordActivity,
    updateSessionActivity,
    
    // Utils
    getCurrentActivityType: () => getActivityType(location.pathname)
  };
};
