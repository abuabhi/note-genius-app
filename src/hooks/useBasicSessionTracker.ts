
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'general' | 'flashcard_study' | 'note_review' | 'quiz_taking';

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

export const useBasicSessionTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Basic state - no complex objects
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityType>('general');
  
  // Track navigation state
  const isInitialLoadRef = useRef(true);
  const lastPathRef = useRef<string>('');
  
  // Derived state
  const isOnStudyPage = isStudyRoute(location.pathname);
  const isActive = !!sessionId;

  console.log('🔄 Session State:', {
    pathname: location.pathname,
    isOnStudyPage,
    isActive,
    isPaused,
    sessionId,
    elapsedSeconds,
    currentActivity
  });

  // Simple timer - runs every second when active and not paused
  useEffect(() => {
    if (!isActive || !startTime || isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, isPaused]);

  // Handle navigation changes - SIMPLIFIED LOGIC
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = lastPathRef.current;
    
    // Skip initial load to prevent unwanted session creation
    if (isInitialLoadRef.current) {
      console.log('🚀 Initial load, skipping navigation logic');
      isInitialLoadRef.current = false;
      lastPathRef.current = currentPath;
      return;
    }

    const wasOnStudyPage = isStudyRoute(lastPath);
    const isNowOnStudyPage = isStudyRoute(currentPath);
    
    console.log('📍 Navigation:', {
      from: lastPath,
      to: currentPath,
      wasOnStudyPage,
      isNowOnStudyPage,
      hasActiveSession: isActive,
      isPaused
    });

    // Case 1: Moving between study pages - MAINTAIN SESSION
    if (wasOnStudyPage && isNowOnStudyPage) {
      console.log('🔄 Moving between study pages - maintaining session');
      if (isActive && isPaused) {
        console.log('▶️ Resuming paused session');
        setIsPaused(false);
      } else if (!isActive) {
        console.log('🚀 No active session - starting new one');
        startSession();
      }
    }
    // Case 2: Entering study area from non-study page
    else if (!wasOnStudyPage && isNowOnStudyPage) {
      console.log('📚 Entering study area');
      if (isActive) {
        console.log('▶️ Resuming existing session');
        setIsPaused(false);
      } else {
        console.log('🚀 Starting new session');
        startSession();
      }
    }
    // Case 3: Leaving study area for non-study page - PAUSE (don't end)
    else if (wasOnStudyPage && !isNowOnStudyPage) {
      console.log('🚪 Leaving study area - pausing session');
      if (isActive && !isPaused) {
        setIsPaused(true);
      }
    }
    
    // Update last path
    lastPathRef.current = currentPath;
  }, [location.pathname]); // ONLY depend on pathname

  // Separate effect for activity type updates
  useEffect(() => {
    if (isOnStudyPage && isActive) {
      const newActivity = getActivityType(location.pathname);
      if (newActivity !== currentActivity) {
        console.log('🏷️ Updating activity type:', newActivity);
        setCurrentActivity(newActivity);
        updateSessionActivity(newActivity);
      }
    }
  }, [location.pathname, isActive, currentActivity]); // Separate dependencies

  const updateSessionActivity = useCallback(async (activityType: ActivityType) => {
    if (!sessionId) return;
    
    try {
      await supabase
        .from('study_sessions')
        .update({
          activity_type: activityType,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      console.log('✅ Updated session activity to:', activityType);
    } catch (error) {
      console.error('❌ Failed to update session activity:', error);
    }
  }, [sessionId]);

  const startSession = useCallback(async () => {
    if (!user) return;
    
    try {
      const now = new Date();
      const activityType = getActivityType(location.pathname);
      
      console.log('🚀 Starting new session with activity:', activityType);
      
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
      setCurrentActivity(activityType);
      
      console.log('✅ Session started:', data.id);
    } catch (error) {
      console.error('❌ Failed to start session:', error);
    }
  }, [user, location.pathname]);

  const endSession = useCallback(async () => {
    if (!sessionId || !startTime) return;

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      console.log('🛑 Ending session:', sessionId, 'Duration:', duration);

      await supabase
        .from('study_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration: Math.max(duration, 1),
          is_active: false
        })
        .eq('id', sessionId);

      setSessionId(null);
      setStartTime(null);
      setElapsedSeconds(0);
      setIsPaused(false);
      setCurrentActivity('general');
      
      console.log('✅ Session ended');
    } catch (error) {
      console.error('❌ Failed to end session:', error);
    }
  }, [sessionId, startTime]);

  const togglePause = useCallback(() => {
    console.log('⏯️ Toggling pause:', !isPaused);
    setIsPaused(prev => !prev);
  }, [isPaused]);

  const recordActivity = useCallback(() => {
    // Simple activity recording - just ensure not paused if on study page
    if (isOnStudyPage && isPaused) {
      setIsPaused(false);
    }
  }, [isOnStudyPage, isPaused]);

  const updateSessionActivityData = useCallback(async (activityData: any) => {
    if (!sessionId || !isActive) return;
    
    try {
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
    } catch (error) {
      console.error('❌ Failed to update session activity:', error);
    }
  }, [sessionId, isActive]);

  return {
    // State
    sessionId,
    isActive,
    startTime,
    elapsedSeconds,
    currentActivity,
    isPaused,
    isOnStudyPage,
    
    // Actions
    startSession,
    endSession,
    togglePause,
    recordActivity,
    updateSessionActivity: updateSessionActivityData
  };
};
