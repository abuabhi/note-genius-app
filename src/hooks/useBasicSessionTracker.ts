
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
  
  // Core session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityType>('general');
  
  // Derived state
  const isOnStudyPage = isStudyRoute(location.pathname);
  const isActive = !!sessionId;

  console.log('🎯 Session State:', {
    pathname: location.pathname,
    isOnStudyPage,
    isActive,
    isPaused,
    sessionId,
    elapsedSeconds,
    currentActivity,
    user: !!user
  });

  // Timer - runs every second when active and not paused
  useEffect(() => {
    if (!isActive || !startTime || isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, isPaused]);

  // Start session
  const startSession = useCallback(async () => {
    if (!user) {
      console.log('❌ Cannot start session - no user');
      return;
    }
    
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

  // End session
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

  // Update activity type
  const updateActivityType = useCallback(async () => {
    if (!sessionId) return;
    
    const newActivity = getActivityType(location.pathname);
    if (newActivity === currentActivity) return;

    try {
      await supabase
        .from('study_sessions')
        .update({
          activity_type: newActivity,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      setCurrentActivity(newActivity);
      console.log('✅ Updated activity type to:', newActivity);
    } catch (error) {
      console.error('❌ Failed to update activity type:', error);
    }
  }, [sessionId, currentActivity, location.pathname]);

  // Simple navigation effect - ULTRA SIMPLIFIED
  useEffect(() => {
    console.log('📍 Navigation Effect:', {
      pathname: location.pathname,
      isOnStudyPage,
      isActive,
      isPaused,
      user: !!user
    });

    if (!user) return;

    // SIMPLE RULE: If on study page and no session -> start one
    if (isOnStudyPage && !isActive) {
      console.log('🚀 On study page without session - starting');
      startSession();
      return;
    }

    // SIMPLE RULE: If on study page and paused session -> resume
    if (isOnStudyPage && isActive && isPaused) {
      console.log('▶️ On study page with paused session - resuming');
      setIsPaused(false);
      return;
    }

    // SIMPLE RULE: If NOT on study page and active session -> pause
    if (!isOnStudyPage && isActive && !isPaused) {
      console.log('⏸️ Left study page - pausing session');
      setIsPaused(true);
      return;
    }

    // Update activity type if on study page with active session
    if (isOnStudyPage && isActive) {
      updateActivityType();
    }
  }, [location.pathname, user, isOnStudyPage, isActive, isPaused, startSession, updateActivityType]);

  const togglePause = useCallback(() => {
    console.log('⏯️ Toggling pause:', !isPaused);
    setIsPaused(prev => !prev);
  }, [isPaused]);

  const recordActivity = useCallback(() => {
    if (isOnStudyPage && isPaused) {
      setIsPaused(false);
    }
  }, [isOnStudyPage, isPaused]);

  const updateSessionActivity = useCallback(async (activityData: any) => {
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
    updateSessionActivity
  };
};
