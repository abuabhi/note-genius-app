
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useImprovedSessionTracker } from './useImprovedSessionTracker';
import { useRealtimeSessionSync } from './useRealtimeSessionSync';
import { useLocation } from 'react-router-dom';

interface AutoSessionState {
  isTracking: boolean;
  currentSessionId: string | null;
  activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general' | null;
  startTime: Date | null;
  elapsedSeconds: number;
}

// Define study routes where auto-session tracking should be active
const STUDY_ROUTES = [
  '/flashcards',
  '/notes',
  '/quizzes',
  '/quiz',
  '/study-sessions'
];

export const useAutoSessionTracker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { shouldTrackSessions } = useRealtimeSessionSync();
  const location = useLocation();
  
  // Use the improved session tracker as the core implementation
  const improvedTracker = useImprovedSessionTracker();
  
  // Add user activity detection - only for study activities
  const lastActivityRef = useRef(Date.now());
  const activityListenersSetup = useRef(false);
  const isOnStudyPage = STUDY_ROUTES.some(route => location.pathname.startsWith(route));

  // Record user activity - only on study pages
  const recordUserActivity = useCallback(() => {
    if (!isOnStudyPage) return;
    
    lastActivityRef.current = Date.now();
    if (improvedTracker.isTracking) {
      improvedTracker.recordActivity();
    }
  }, [improvedTracker, isOnStudyPage]);

  // Setup activity listeners only for study pages
  useEffect(() => {
    // Clean up existing listeners
    if (activityListenersSetup.current) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.removeEventListener(event, recordUserActivity);
      });
      activityListenersSetup.current = false;
    }

    // Only set up listeners on study pages
    if (!isOnStudyPage) return;
    
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
  }, [recordUserActivity, isOnStudyPage]);

  // Auto-end session when leaving study pages
  useEffect(() => {
    if (!isOnStudyPage && improvedTracker.isTracking) {
      console.log('Left study area, ending auto session');
      improvedTracker.endSession();
    }
  }, [isOnStudyPage, improvedTracker]);

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

    if (!isOnStudyPage) {
      console.log('Not on study page, not starting session');
      return null;
    }
    
    return improvedTracker.startSession(activityType, title, subject);
  }, [improvedTracker, shouldTrackSessions, isOnStudyPage]);

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
    if (!isOnStudyPage) return;
    
    recordUserActivity();
    return improvedTracker.updateSessionActivity(activityData);
  }, [improvedTracker, recordUserActivity, isOnStudyPage]);

  return {
    isTracking: improvedTracker.isTracking && isOnStudyPage,
    currentSessionId: improvedTracker.currentSessionId,
    activityType: improvedTracker.activityType,
    startTime: improvedTracker.startTime,
    elapsedSeconds: improvedTracker.elapsedSeconds,
    startSession,
    endSession,
    updateSessionActivity,
    autoSaveSession: improvedTracker.autoSaveSession,
    isOnStudyPage
  };
};
