
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/config/environment';

export type ActivityType = 'general' | 'flashcard_study' | 'note_review' | 'quiz_taking';

interface SessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  currentActivity: ActivityType | null;
  isPaused: boolean;
  isOnStudyPage: boolean;
}

const STUDY_ROUTES = ['/flashcards', '/notes', '/quiz', '/study'];
const UPDATE_INTERVAL = 1000; // 1 second
const PERSISTENCE_KEY = 'optimized_session_state';

const isStudyRoute = (pathname: string): boolean => {
  return STUDY_ROUTES.some(route => pathname.startsWith(route));
};

const getActivityType = (pathname: string): ActivityType => {
  if (pathname.startsWith('/flashcards')) return 'flashcard_study';
  if (pathname.startsWith('/notes')) return 'note_review';
  if (pathname.startsWith('/quiz')) return 'quiz_taking';
  return 'general';
};

export const useOptimizedSessionTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Single state object to minimize re-renders
  const [sessionState, setSessionState] = useState<SessionState>({
    sessionId: null,
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
    currentActivity: null,
    isPaused: false,
    isOnStudyPage: isStudyRoute(location.pathname)
  });

  // Refs to prevent unnecessary effect dependencies
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Optimized timer that only runs when needed
  useEffect(() => {
    if (sessionState.isActive && !sessionState.isPaused && sessionState.startTime) {
      timerRef.current = setInterval(() => {
        if (!mountedRef.current) return;
        
        const now = Date.now();
        if (now - lastUpdateRef.current < 900) return; // Throttle updates
        
        lastUpdateRef.current = now;
        
        setSessionState(prev => {
          if (!prev.startTime) return prev;
          
          const newElapsed = Math.floor((now - prev.startTime.getTime()) / 1000);
          
          // Only update if actually changed
          if (newElapsed === prev.elapsedSeconds) return prev;
          
          const newState = { ...prev, elapsedSeconds: newElapsed };
          
          // Throttled persistence
          if (newElapsed % 30 === 0) { // Every 30 seconds
            try {
              sessionStorage.setItem(PERSISTENCE_KEY, JSON.stringify({
                ...newState,
                startTime: newState.startTime?.toISOString()
              }));
            } catch (error) {
              logger.warn('Failed to persist session state:', error);
            }
          }
          
          return newState;
        });
      }, UPDATE_INTERVAL);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionState.isActive, sessionState.isPaused, sessionState.startTime]);

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PERSISTENCE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.startTime) {
          parsed.startTime = new Date(parsed.startTime);
          
          // Validate session isn't too old (max 4 hours)
          const age = Date.now() - parsed.startTime.getTime();
          if (age < 4 * 60 * 60 * 1000) {
            setSessionState(prev => ({
              ...prev,
              ...parsed,
              elapsedSeconds: Math.floor(age / 1000),
              isOnStudyPage: isStudyRoute(location.pathname)
            }));
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to restore session state:', error);
    }
  }, [location.pathname]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Optimized session start
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
          subject: activityType === 'general' ? 'Multi-Activity Study' : activityType.replace('_', ' '),
          start_time: now.toISOString(),
          is_active: true,
          activity_type: activityType,
          auto_created: true
        })
        .select('id')
        .single();

      if (error) throw error;

      const newState = {
        sessionId: data.id,
        isActive: true,
        startTime: now,
        elapsedSeconds: 0,
        currentActivity: activityType,
        isPaused: false,
        isOnStudyPage: isStudyRoute(location.pathname)
      };
      
      setSessionState(newState);
      logger.info('✅ Session started:', data.id);
      
    } catch (error) {
      logger.error('Failed to start session:', error);
    }
  }, [user, location.pathname, sessionState.isActive]);

  // Optimized session end
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

      // Clear persistence
      try {
        sessionStorage.removeItem(PERSISTENCE_KEY);
      } catch (error) {
        logger.warn('Failed to clear persisted session:', error);
      }

      logger.info('✅ Session ended');
    } catch (error) {
      logger.error('Failed to end session:', error);
    }
  }, [sessionState.sessionId, sessionState.startTime, location.pathname]);

  // Optimized toggle pause
  const togglePause = useCallback(() => {
    setSessionState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // Handle navigation changes efficiently
  useEffect(() => {
    const isOnStudyPage = isStudyRoute(location.pathname);
    const newActivity = getActivityType(location.pathname);
    
    setSessionState(prev => {
      // Only update if something actually changed
      if (prev.isOnStudyPage === isOnStudyPage && prev.currentActivity === newActivity) {
        return prev;
      }
      
      const updates: Partial<SessionState> = { isOnStudyPage };
      
      // Update activity if changed
      if (prev.currentActivity !== newActivity) {
        updates.currentActivity = newActivity;
        
        // Update database activity type if session is active
        if (prev.sessionId && prev.isActive) {
          supabase
            .from('study_sessions')
            .update({
              activity_type: newActivity,
              updated_at: new Date().toISOString()
            })
            .eq('id', prev.sessionId)
            .then(({ error }) => {
              if (error) logger.error('Failed to update activity type:', error);
            });
        }
      }
      
      // Handle pause/resume based on study page status
      if (prev.isActive) {
        if (isOnStudyPage && prev.isPaused) {
          updates.isPaused = false; // Resume when entering study area
        } else if (!isOnStudyPage && !prev.isPaused) {
          updates.isPaused = true; // Pause when leaving study area
        }
      }
      
      return { ...prev, ...updates };
    });
  }, [location.pathname]);

  return {
    // State
    ...sessionState,
    
    // Actions
    startSession,
    endSession,
    togglePause
  };
};
