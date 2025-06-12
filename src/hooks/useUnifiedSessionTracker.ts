import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/config/environment';

// Event types for the session system
export type SessionEvent = 
  | 'session_started'
  | 'session_ended'
  | 'session_paused'
  | 'session_resumed'
  | 'activity_detected'
  | 'idle_warning'
  | 'auto_paused'
  | 'visibility_changed'
  | 'activity_type_changed';

export type ActivityType = 'general' | 'flashcard_study' | 'note_review' | 'quiz_taking';

export interface SessionState {
  sessionId: string | null;
  isActive: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  currentActivity: ActivityType | null;
  isPaused: boolean;
  isOnStudyPage: boolean;
  lastActivityTime: Date | null;
}

export interface SessionEventData {
  type: SessionEvent;
  sessionId?: string;
  timestamp: Date;
  data?: any;
}

// Session event listeners type
type SessionEventListener = (event: SessionEventData) => void;

// Study routes configuration - consolidated and improved
const STUDY_ROUTES = [
  '/flashcards',
  '/notes',
  '/quiz',
  '/study'
];

const isStudyRoute = (pathname: string): boolean => {
  return STUDY_ROUTES.some(route => pathname.startsWith(route));
};

// Helper function to check if two routes are related study routes
const areRelatedStudyRoutes = (current: string, previous: string | null): boolean => {
  if (!previous) return false;
  // ALL study routes are now considered related - this prevents session resets
  return isStudyRoute(current) && isStudyRoute(previous);
};

export const useUnifiedSessionTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Core session state
  const [sessionState, setSessionState] = useState<SessionState>({
    sessionId: null,
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
    currentActivity: null,
    isPaused: false,
    isOnStudyPage: false,
    lastActivityTime: null
  });

  // Event system
  const eventListeners = useRef<Map<SessionEvent, Set<SessionEventListener>>>(new Map());
  const pendingUpdates = useRef<any[]>([]);
  const updateTimer = useRef<NodeJS.Timeout | null>(null);
  const activityTimer = useRef<NodeJS.Timeout | null>(null);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // Navigation tracking refs
  const previousLocationRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const lastProcessedPathRef = useRef<string | null>(null);

  // Constants
  const IDLE_WARNING_TIME = 2 * 60 * 1000; // 2 minutes
  const AUTO_PAUSE_TIME = 3 * 60 * 1000; // 3 minutes
  const AUTO_END_TIME = 15 * 60 * 1000; // 15 minutes
  const BATCH_UPDATE_INTERVAL = 5000; // 5 seconds

  // Event system methods
  const addEventListener = useCallback((event: SessionEvent, listener: SessionEventListener) => {
    if (!eventListeners.current.has(event)) {
      eventListeners.current.set(event, new Set());
    }
    eventListeners.current.get(event)!.add(listener);
    
    return () => {
      eventListeners.current.get(event)?.delete(listener);
    };
  }, []);

  const emitEvent = useCallback((event: SessionEvent, data?: any) => {
    const eventData: SessionEventData = {
      type: event,
      sessionId: sessionState.sessionId || undefined,
      timestamp: new Date(),
      data
    };

    logger.info(`📡 Session Event: ${event}`, eventData);
    
    const listeners = eventListeners.current.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(eventData);
        } catch (error) {
          logger.error(`Error in session event listener for ${event}:`, error);
        }
      });
    }
  }, [sessionState.sessionId]);

  // Activity detection
  const getCurrentActivityType = useCallback((): ActivityType => {
    const path = location.pathname;
    if (path.startsWith('/flashcards')) return 'flashcard_study';
    if (path.startsWith('/notes')) return 'note_review';
    if (path.startsWith('/quiz')) return 'quiz_taking';
    return 'general';
  }, [location.pathname]);

  // Batched database updates for performance
  const batchDatabaseUpdate = useCallback(async () => {
    if (pendingUpdates.current.length === 0 || !sessionState.sessionId) return;

    const updates = [...pendingUpdates.current];
    pendingUpdates.current = [];

    try {
      const mergedUpdate = updates.reduce((acc, update) => ({ ...acc, ...update }), {});
      
      const { error } = await supabase
        .from('study_sessions')
        .update({
          ...mergedUpdate,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionState.sessionId);

      if (error) throw error;
      
      logger.info('📊 Batched session update successful', mergedUpdate);
    } catch (error) {
      logger.error('❌ Batched session update failed:', error);
      // Re-add failed updates to retry later
      pendingUpdates.current.unshift(...updates);
    }
  }, [sessionState.sessionId]);

  // Schedule batched updates
  const scheduleBatchUpdate = useCallback((updateData: any) => {
    pendingUpdates.current.push(updateData);
    
    if (updateTimer.current) {
      clearTimeout(updateTimer.current);
    }
    
    updateTimer.current = setTimeout(batchDatabaseUpdate, BATCH_UPDATE_INTERVAL);
  }, [batchDatabaseUpdate]);

  // Update session activity - this method was missing
  const updateSessionActivity = useCallback(async (activityData: any) => {
    if (!sessionState.sessionId || !sessionState.isActive) return;

    scheduleBatchUpdate(activityData);
  }, [sessionState.sessionId, sessionState.isActive, scheduleBatchUpdate]);

  // Start session with error recovery
  const startSession = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    const currentPath = location.pathname;
    if (!isStudyRoute(currentPath)) {
      logger.info('Not starting session - not on study page');
      return false;
    }

    // If we already have an active session, just ensure it's not paused and update activity type
    if (sessionState.isActive && sessionState.sessionId) {
      logger.info('✅ Session already active - maintaining continuity');
      setSessionState(prev => ({ 
        ...prev, 
        isPaused: false,
        isOnStudyPage: true,
        currentActivity: getCurrentActivityType()
      }));
      emitEvent('session_resumed');
      return true;
    }

    try {
      const activityType = getCurrentActivityType();
      const now = new Date();

      const sessionData = {
        user_id: user.id,
        title: `Study Session - ${activityType.replace('_', ' ')}`,
        subject: activityType === 'general' ? 'Multi-Activity Study' : activityType.replace('_', ' '),
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

      const newSessionState = {
        sessionId: data.id,
        isActive: true,
        startTime: now,
        elapsedSeconds: 0,
        currentActivity: activityType,
        isPaused: false,
        isOnStudyPage: true,
        lastActivityTime: now
      };

      setSessionState(newSessionState);
      
      // Persist to session storage
      sessionStorage.setItem('unified_session_state', JSON.stringify({
        ...newSessionState,
        startTime: now.toISOString()
      }));

      emitEvent('session_started', { sessionId: data.id, activityType });
      
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['timezone-aware-analytics'] });
      
      logger.info('✅ Unified session started:', data.id);
      return true;
      
    } catch (error) {
      logger.error('❌ Failed to start session:', error);
      toast({
        title: "Session Error",
        description: "Failed to start study session. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, sessionState.isActive, sessionState.sessionId, location.pathname, getCurrentActivityType, emitEvent, queryClient]);

  // End session with validation
  const endSession = useCallback(async (): Promise<boolean> => {
    if (!sessionState.sessionId || !sessionState.startTime) return false;

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - sessionState.startTime.getTime()) / 1000);
      const validatedDuration = Math.min(Math.max(duration, 1), 8 * 60 * 60); // 1 sec to 8 hours

      const { error } = await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: validatedDuration,
          is_active: false
        })
        .eq('id', sessionState.sessionId);

      if (error) throw error;

      const endedSessionId = sessionState.sessionId;
      
      setSessionState({
        sessionId: null,
        isActive: false,
        startTime: null,
        elapsedSeconds: 0,
        currentActivity: null,
        isPaused: false,
        isOnStudyPage: isStudyRoute(location.pathname),
        lastActivityTime: null
      });

      // Clear persisted state
      sessionStorage.removeItem('unified_session_state');
      
      // Clear timers
      if (updateTimer.current) clearTimeout(updateTimer.current);
      if (activityTimer.current) clearTimeout(activityTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);

      emitEvent('session_ended', { sessionId: endedSessionId, duration: validatedDuration });
      
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['timezone-aware-analytics'] });
      
      logger.info('✅ Unified session ended:', endedSessionId);
      return true;
      
    } catch (error) {
      logger.error('❌ Failed to end session:', error);
      return false;
    }
  }, [sessionState, location.pathname, emitEvent, queryClient]);

  // Record activity with idle detection
  const recordActivity = useCallback(() => {
    if (!sessionState.isActive) return;

    const now = new Date();
    
    setSessionState(prev => ({
      ...prev,
      lastActivityTime: now,
      isPaused: false // Resume if paused
    }));

    // Clear existing idle timers
    if (idleTimer.current) clearTimeout(idleTimer.current);
    
    // Set new idle detection
    idleTimer.current = setTimeout(() => {
      toast({
        title: "Idle Warning",
        description: "You'll be paused in 1 minute due to inactivity.",
        variant: "default",
      });
      emitEvent('idle_warning');
      
      // Auto-pause after warning
      setTimeout(() => {
        if (sessionState.isActive && !sessionState.isPaused) {
          setSessionState(prev => ({ ...prev, isPaused: true }));
          emitEvent('auto_paused');
          toast({
            title: "Session Paused",
            description: "Paused due to inactivity. Resume anytime!",
            variant: "default",
          });
        }
      }, 60000); // 1 minute after warning
    }, IDLE_WARNING_TIME);

    emitEvent('activity_detected');
  }, [sessionState.isActive, sessionState.isPaused, emitEvent]);

  // Update activity type - CRITICAL FIX: This should NOT restart the session
  const updateActivityType = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.isActive) return;

    const newActivityType = getCurrentActivityType();
    if (newActivityType === sessionState.currentActivity) return;

    logger.info('🔄 Updating activity type from', sessionState.currentActivity, 'to', newActivityType, '(PRESERVING SESSION TIMING)');

    // Update database without affecting session timing
    scheduleBatchUpdate({ activity_type: newActivityType });
    
    // Update local state while preserving ALL timing information
    setSessionState(prev => ({
      ...prev,
      currentActivity: newActivityType,
      isPaused: false // Ensure session stays active when updating activity type
    }));

    // Update persisted state
    const currentState = {
      ...sessionState,
      currentActivity: newActivityType,
      isPaused: false
    };
    
    sessionStorage.setItem('unified_session_state', JSON.stringify({
      ...currentState,
      startTime: sessionState.startTime?.toISOString()
    }));

    emitEvent('activity_type_changed', { 
      oldActivity: sessionState.currentActivity, 
      newActivity: newActivityType 
    });

    logger.info('✅ Activity type updated - SESSION TIMING PRESERVED');
  }, [sessionState, getCurrentActivityType, scheduleBatchUpdate, emitEvent]);

  // Toggle pause
  const togglePause = useCallback(() => {
    const newPausedState = !sessionState.isPaused;
    
    setSessionState(prev => ({
      ...prev,
      isPaused: newPausedState
    }));

    emitEvent(newPausedState ? 'session_paused' : 'session_resumed');
    
    if (!newPausedState) {
      recordActivity(); // Reset idle detection when resuming
    }
  }, [sessionState.isPaused, emitEvent, recordActivity]);

  // NAVIGATION EFFECTS - Consolidated and fixed
  useEffect(() => {
    const currentPath = location.pathname;
    const isOnStudy = isStudyRoute(currentPath);
    const previousPath = previousLocationRef.current;
    const wasOnStudyPage = previousPath ? isStudyRoute(previousPath) : false;

    // Skip if we've already processed this path to prevent excessive calls
    if (lastProcessedPathRef.current === currentPath) {
      return;
    }

    logger.info('📍 Navigation detected:', {
      currentPath,
      previousPath,
      isOnStudy,
      wasOnStudyPage,
      isInitialLoad: isInitialLoadRef.current,
      hasActiveSession: sessionState.isActive,
      sessionId: sessionState.sessionId,
      isPaused: sessionState.isPaused,
      areRelated: areRelatedStudyRoutes(currentPath, previousPath)
    });

    // Update processed path reference
    lastProcessedPathRef.current = currentPath;

    // Update isOnStudyPage state
    setSessionState(prev => ({
      ...prev,
      isOnStudyPage: isOnStudy
    }));

    // Skip processing on initial load to avoid unwanted session creation
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousLocationRef.current = currentPath;
      
      // On initial load, only start session if on study page and no active session
      if (isOnStudy && !sessionState.isActive) {
        logger.info('🚀 Initial load on study page - starting session');
        startSession();
      }
      return;
    }

    // Update previous location reference
    previousLocationRef.current = currentPath;

    // Check if we're moving between study routes (ALL study routes are related)
    const areRelated = areRelatedStudyRoutes(currentPath, previousPath);

    if (isOnStudy && wasOnStudyPage && areRelated) {
      // CRITICAL FIX: Moving between study pages - maintain session, just update activity type
      logger.info('🔄 Moving between study pages - MAINTAINING SESSION, updating activity only');
      if (sessionState.isActive) {
        // Ensure session is not paused when on study pages
        if (sessionState.isPaused) {
          logger.info('▶️ Resuming session when moving between study pages');
          setSessionState(prev => ({ ...prev, isPaused: false }));
        }
        updateActivityType();
      } else {
        // Should have a session when on study pages
        logger.info('🚀 On study page without session - starting session');
        startSession();
      }
      
    } else if (isOnStudy && !wasOnStudyPage) {
      // Entering study area from non-study page
      if (sessionState.isActive) {
        // Resume existing session and ensure it's not paused
        logger.info('▶️ Entering study area - resuming existing session');
        setSessionState(prev => ({ ...prev, isPaused: false }));
        updateActivityType();
      } else {
        // Start new session
        logger.info('🚀 Entering study area - starting new session');
        startSession();
      }
      
    } else if (!isOnStudy && wasOnStudyPage) {
      // FIXED: Leaving study area for non-study page - pause but keep counter running
      if (sessionState.isActive && !sessionState.isPaused) {
        logger.info('⏸️ Leaving study area - pausing session (counter continues)');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    } else if (!isOnStudy && !wasOnStudyPage) {
      // Moving between non-study pages - ensure session is paused if active
      if (sessionState.isActive && !sessionState.isPaused) {
        logger.info('⏸️ On non-study page with active session - pausing');
        setSessionState(prev => ({ ...prev, isPaused: true }));
      }
    }
  }, [location.pathname, sessionState.isActive, sessionState.isPaused, startSession, updateActivityType]);

  // Session restoration on mount
  useEffect(() => {
    if (!user) return;

    try {
      const stored = sessionStorage.getItem('unified_session_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        const sessionAge = Date.now() - new Date(parsed.startTime).getTime();
        
        // Only restore if session is less than 2 hours old
        if (sessionAge < 2 * 60 * 60 * 1000) {
          const restoredState = {
            ...parsed,
            startTime: new Date(parsed.startTime),
            elapsedSeconds: Math.floor(sessionAge / 1000),
            isOnStudyPage: isStudyRoute(location.pathname)
          };
          
          setSessionState(restoredState);
          logger.info('🔄 Session restored from storage');
        } else {
          sessionStorage.removeItem('unified_session_state');
        }
      }
    } catch (error) {
      logger.error('Failed to restore session:', error);
      sessionStorage.removeItem('unified_session_state');
    }
  }, [user, location.pathname]);

  // Timer management - CRITICAL: This ensures the counter keeps running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (sessionState.isActive && sessionState.startTime) {
      // Timer runs regardless of pause state - this keeps the counter going
      interval = setInterval(() => {
        const now = new Date();
        const newElapsedSeconds = Math.floor((now.getTime() - sessionState.startTime!.getTime()) / 1000);
        
        setSessionState(prev => ({
          ...prev,
          elapsedSeconds: newElapsedSeconds
        }));

        // Update persisted state
        const updatedState = {
          ...sessionState,
          elapsedSeconds: newElapsedSeconds
        };
        
        sessionStorage.setItem('unified_session_state', JSON.stringify({
          ...updatedState,
          startTime: sessionState.startTime?.toISOString()
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionState.isActive, sessionState.startTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimer.current) clearTimeout(updateTimer.current);
      if (activityTimer.current) clearTimeout(activityTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return {
    // State
    ...sessionState,
    
    // Actions
    startSession,
    endSession,
    togglePause,
    recordActivity,
    updateActivityType,
    updateSessionActivity,
    
    // Event system
    addEventListener,
    emitEvent,
    
    // Utils
    getCurrentActivityType: getCurrentActivityType(),
    
    // Debug info
    debug: {
      pendingUpdates: pendingUpdates.current.length,
      eventListeners: eventListeners.current.size
    }
  };
};
