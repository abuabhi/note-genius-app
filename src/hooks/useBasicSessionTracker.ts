
import { useState, useEffect, useCallback } from 'react';
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
  
  // Derived state
  const isOnStudyPage = isStudyRoute(location.pathname);
  const isActive = !!sessionId;
  const currentActivity = getActivityType(location.pathname);

  // Simple timer - runs every second when active
  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Simple navigation handling
  useEffect(() => {
    if (isOnStudyPage && !isActive) {
      // Start session when entering study page
      startSession();
    }
    
    if (isActive) {
      // Pause when leaving study pages, resume when returning
      setIsPaused(!isOnStudyPage);
    }
  }, [isOnStudyPage, isActive]);

  const startSession = useCallback(async () => {
    if (!user || isActive) return;
    
    try {
      const now = new Date();
      const activityType = getActivityType(location.pathname);
      
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          title: `Study Session`,
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
      
      console.log('✅ Session started:', data.id);
    } catch (error) {
      console.error('❌ Failed to start session:', error);
    }
  }, [user, location.pathname, isActive]);

  const endSession = useCallback(async () => {
    if (!sessionId || !startTime) return;

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

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
      
      console.log('✅ Session ended');
    } catch (error) {
      console.error('❌ Failed to end session:', error);
    }
  }, [sessionId, startTime]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const recordActivity = useCallback(() => {
    // Simple activity recording - just ensure not paused if on study page
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
