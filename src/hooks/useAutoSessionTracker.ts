
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
  '/quiz',
  '/quizzes',
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
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnStudyPage = STUDY_ROUTES.some(route => location.pathname.startsWith(route));

  console.log('🎯 Auto-session tracker status:', {
    isOnStudyPage,
    currentPath: location.pathname,
    isTracking: improvedTracker.isTracking,
    shouldTrack: shouldTrackSessions()
  });

  // Record user activity - only on study pages
  const recordUserActivity = useCallback(() => {
    if (!isOnStudyPage) return;
    
    lastActivityRef.current = Date.now();
    if (improvedTracker.isTracking) {
      improvedTracker.recordActivity();
    }
  }, [improvedTracker, isOnStudyPage]);

  // Auto-start session with delay when entering study pages
  useEffect(() => {
    if (isOnStudyPage && !improvedTracker.isTracking && shouldTrackSessions()) {
      console.log('🚀 Scheduling auto-session start for study page:', location.pathname);
      
      // Clear any existing timeout
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
      
      // Start session after 3 seconds of being on study page
      autoStartTimeoutRef.current = setTimeout(() => {
        if (isOnStudyPage && !improvedTracker.isTracking && shouldTrackSessions()) {
          console.log('✨ Auto-starting study session on page:', location.pathname);
          
          let activityType: 'flashcard_study' | 'note_review' | 'quiz_taking' | 'general' = 'general';
          let title = 'Study Session';
          
          if (location.pathname.startsWith('/flashcards')) {
            activityType = 'flashcard_study';
            title = 'Flashcard Study Session';
          } else if (location.pathname.startsWith('/notes')) {
            activityType = 'note_review';
            title = 'Note Review Session';
          } else if (location.pathname.startsWith('/quiz')) {
            activityType = 'quiz_taking';
            title = 'Quiz Session';
          }
          
          improvedTracker.startSession(activityType, title, 'Auto-detected');
        }
      }, 3000); // 3 second delay
    }

    return () => {
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
        autoStartTimeoutRef.current = null;
      }
    };
  }, [isOnStudyPage, improvedTracker.isTracking, shouldTrackSessions, location.pathname, improvedTracker]);

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
      console.log('🛑 Left study area, ending auto session');
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
      console.log('🚫 Another tab is tracking sessions, not starting session here');
      return null;
    }

    if (!isOnStudyPage) {
      console.log('🚫 Not on study page, not starting session');
      return null;
    }
    
    console.log('✅ Starting manual session:', { activityType, title, subject });
    return improvedTracker.startSession(activityType, title, subject);
  }, [improvedTracker, shouldTrackSessions, isOnStudyPage]);

  // Enhanced endSession
  const endSession = useCallback(async () => {
    console.log('🔚 Ending session');
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
