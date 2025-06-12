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
  | 'visibility_changed';

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

// Study routes configuration
const STUDY_ROUTES = [
  '/flashcards',
  '/notes',
  '/quiz',
  '/study'
];

const isStudyRoute = (pathname: string): boolean => {
  return STUDY_ROUTES.some(route => pathname.startsWith(route));
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
    if (!user || sessionState.isActive) return false;

    const currentPath = location.pathname;
    if (!isStudyRoute(currentPath)) {
      logger.info('Not starting session - not on study page');
      return false;
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
  }, [user, sessionState.isActive, location.pathname, getCurrentActivityType, emitEvent, queryClient]);

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

  // Update activity type
  const updateActivityType = useCallback(async () => {
    if (!sessionState.sessionId || !sessionState.isActive) return;

    const newActivityType = getCurrentActivityType();
    if (newActivityType === sessionState.currentActivity) return;

    scheduleBatchUpdate({ activity_type: newActivityType });
    
    setSessionState(prev => ({
      ...prev,
      currentActivity: newActivityType
    }));

    emitEvent('activity_detected', { activityType: newActivityType });
  }, [sessionState.sessionId, sessionState.isActive, sessionState.currentActivity, getCurrentActivityType, scheduleBatchUpdate, emitEvent]);

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

  // Timer management
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (sessionState.isActive && !sessionState.isPaused && sessionState.startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const newElapsedSeconds = Math.floor((now.getTime() - sessionState.startTime!.getTime()) / 1000);
        
        setSessionState(prev => ({
          ...prev,
          elapsedSeconds: newElapsedSeconds
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionState.isActive, sessionState.isPaused, sessionState.startTime]);

  // Navigation effects
  useEffect(() => {
    const isOnStudy = isStudyRoute(location.pathname);
    
    setSessionState(prev => ({
      ...prev,
      isOnStudyPage: isOnStudy
    }));

    if (isOnStudy && !sessionState.isActive) {
      startSession();
    } else if (isOnStudy && sessionState.isActive) {
      updateActivityType();
    }
  }, [location.pathname, sessionState.isActive, startSession, updateActivityType]);

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
    updateSessionActivity, // Add this method
    
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
