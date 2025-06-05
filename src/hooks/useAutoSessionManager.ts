
import { useEffect, useRef, useState } from 'react';
import { useEnhancedStudySessions } from './useEnhancedStudySessions';

interface AutoSessionConfig {
  activityType: 'flashcard' | 'quiz' | 'note';
  resourceId?: string;
  resourceName?: string;
  subject?: string;
}

export const useAutoSessionManager = (config?: AutoSessionConfig) => {
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const sessionTimeoutRef = useRef<NodeJS.Timeout>();
  const { createAutoSession, trackActivity, updateSessionPerformance, endSession } = useEnhancedStudySessions();

  // Auto-start session when component mounts with config
  useEffect(() => {
    if (config && !isSessionActive) {
      startAutoSession();
    }

    // Cleanup on unmount
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
      if (isSessionActive && currentSession) {
        endCurrentSession();
      }
    };
  }, [config]);

  const startAutoSession = async () => {
    if (!config || isSessionActive) return;

    try {
      const sessionTitle = `${config.activityType.charAt(0).toUpperCase() + config.activityType.slice(1)} Session`;
      const title = config.resourceName ? `${sessionTitle}: ${config.resourceName}` : sessionTitle;

      const session = await createAutoSession.mutateAsync({
        activity_type: config.activityType,
        title,
        subject: config.subject,
        resource_id: config.resourceId
      });

      setCurrentSession(session);
      setIsSessionActive(true);

      // Track the activity start
      await trackActivity.mutateAsync({
        session_id: session.id,
        activity_type: config.activityType,
        resource_id: config.resourceId,
        performance_data: {
          started_at: new Date().toISOString()
        }
      });

      console.log('Auto session started:', session);
    } catch (error) {
      console.error('Failed to start auto session:', error);
    }
  };

  const endCurrentSession = async () => {
    if (!currentSession || !isSessionActive) return;

    try {
      await endSession.mutateAsync(currentSession.id);
      setCurrentSession(null);
      setIsSessionActive(false);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const updateSessionWithPerformance = async (performanceData: {
    cards_reviewed?: number;
    cards_correct?: number;
    quiz_score?: number;
    quiz_total_questions?: number;
    notes_created?: number;
    notes_reviewed?: number;
  }) => {
    if (!currentSession) return;

    try {
      await updateSessionPerformance.mutateAsync({
        sessionId: currentSession.id,
        ...performanceData
      });
    } catch (error) {
      console.error('Failed to update session performance:', error);
    }
  };

  const trackActivityEvent = async (eventData: {
    performance_data?: Record<string, any>;
    duration_seconds?: number;
  }) => {
    if (!currentSession || !config) return;

    try {
      await trackActivity.mutateAsync({
        session_id: currentSession.id,
        activity_type: config.activityType,
        resource_id: config.resourceId,
        ...eventData
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  };

  // Auto-end session after period of inactivity
  const resetInactivityTimer = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    // End session after 30 minutes of inactivity
    sessionTimeoutRef.current = setTimeout(() => {
      if (isSessionActive) {
        endCurrentSession();
      }
    }, 30 * 60 * 1000);
  };

  // Call this whenever user interacts with the activity
  const recordActivity = (activityData?: any) => {
    resetInactivityTimer();
    if (activityData) {
      trackActivityEvent({ performance_data: activityData });
    }
  };

  return {
    currentSession,
    isSessionActive,
    startAutoSession,
    endCurrentSession,
    updateSessionWithPerformance,
    trackActivityEvent,
    recordActivity
  };
};
