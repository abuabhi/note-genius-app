
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useImprovedSessionTracker } from './useImprovedSessionTracker';
import { useRealtimeSessionSync } from './useRealtimeSessionSync';

interface AutoSessionState {
  isTracking: boolean;
  currentSessionId: string | null;
  activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general' | null;
  startTime: Date | null;
  elapsedSeconds: number;
}

export const useAutoSessionTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { shouldTrackSessions } = useRealtimeSessionSync();
  
  // Use the improved session tracker as the core implementation
  const improvedTracker = useImprovedSessionTracker();
  
  // Add user activity detection
  const lastActivityRef = useRef(Date.now());
  const activityListenersSetup = useRef(false);

  // Record user activity
  const recordUserActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (improvedTracker.isTracking) {
      improvedTracker.recordActivity();
    }
  }, [improvedTracker]);

  // Setup activity listeners
  useEffect(() => {
    if (activityListenersSetup.current) return;
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, recordUserActivity, { passive: true });
    });
    
    activityListenersSetup.current = true;

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, recordUserActivity);
      });
      activityListenersSetup.current = false;
    };
  }, [recordUserActivity]);

  // Enhanced startSession that only works if this tab should track sessions
  const startSession = useCallback(async (
    activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general',
    title?: string,
    subject?: string
  ) => {
    if (!shouldTrackSessions()) {
      console.log('Another tab is tracking sessions, not starting session here');
      return null;
    }
    
    return improvedTracker.startSession(activityType, title, subject);
  }, [improvedTracker, shouldTrackSessions]);

  // Enhanced endSession
  const endSession = useCallback(async () => {
    return improvedTracker.endSession();
  }, [improvedTracker]);

  // Enhanced updateSessionActivity with user activity recording
  const updateSessionActivity = useCallback(async (activityData: {
    cards_reviewed?: number;
    cards_correct?: number;
    quiz_score?: number;
    quiz_total_questions?: number;
    notes_created?: number;
    notes_reviewed?: number;
  }) => {
    recordUserActivity();
    return improvedTracker.updateSessionActivity(activityData);
  }, [improvedTracker, recordUserActivity]);

  return {
    isTracking: improvedTracker.isTracking,
    currentSessionId: improvedTracker.currentSessionId,
    activityType: improvedTracker.activityType,
    startTime: improvedTracker.startTime,
    elapsedSeconds: improvedTracker.elapsedSeconds,
    startSession,
    endSession,
    updateSessionActivity,
    autoSaveSession: improvedTracker.autoSaveSession
  };
};
