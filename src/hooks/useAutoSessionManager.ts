
import { useState, useEffect, useCallback } from 'react';
import { useEnhancedStudySessions } from './useEnhancedStudySessions';
import { useAdaptiveLearning } from './progress/adaptive';
import { useAuth } from '@/contexts/auth';

interface AutoSessionConfig {
  activityType: 'flashcard' | 'quiz' | 'note';
  resourceId?: string;
  resourceName?: string;
  subject?: string;
}

interface SessionPerformanceUpdate {
  cards_reviewed?: number;
  cards_correct?: number;
  quiz_score?: number;
  quiz_total_questions?: number;
  notes_created?: number;
  notes_reviewed?: number;
}

export const useAutoSessionManager = (config: AutoSessionConfig) => {
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<Date | null>(null);
  const [hasStartedStudying, setHasStartedStudying] = useState(false);
  
  const { user } = useAuth();
  const { createAutoSession, updateSessionPerformance, endSession } = useEnhancedStudySessions();
  const { adaptiveLearningInsights } = useAdaptiveLearning();

  // Create session only when study activity actually begins
  const startStudySession = useCallback(async () => {
    if (!user || isSessionActive || hasStartedStudying) return;

    try {
      const sessionTitle = `${config.activityType.charAt(0).toUpperCase() + config.activityType.slice(1)} Session: ${config.resourceName || 'Study'}`;
      
      const result = await createAutoSession.mutateAsync({
        activity_type: config.activityType,
        title: sessionTitle,
        subject: config.subject,
        resource_id: config.resourceId
      });

      setCurrentSession(result);
      setIsSessionActive(true);
      setLastActivityTime(new Date());
      setHasStartedStudying(true);
      
      console.log('Auto-created study session on first study action:', result.id);
    } catch (error) {
      console.error('Failed to create auto session:', error);
    }
  }, [user, config, isSessionActive, hasStartedStudying, createAutoSession]);

  // Update session performance data
  const updateSessionWithPerformance = useCallback(async (performanceData: SessionPerformanceUpdate) => {
    if (!currentSession || !isSessionActive) return;

    try {
      await updateSessionPerformance.mutateAsync({
        sessionId: currentSession.id,
        ...performanceData
      });
      
      setLastActivityTime(new Date());
    } catch (error) {
      console.error('Failed to update session performance:', error);
    }
  }, [currentSession, isSessionActive, updateSessionPerformance]);

  // Record study activity - this triggers session creation on first call
  const recordStudyActivity = useCallback(async (activityData?: Record<string, any>) => {
    // Start session on first study activity
    if (!hasStartedStudying && !isSessionActive) {
      await startStudySession();
    }
    
    setLastActivityTime(new Date());
    
    // Log activity for adaptive learning analysis
    console.log('Study activity recorded:', {
      sessionId: currentSession?.id,
      activityType: config.activityType,
      timestamp: new Date().toISOString(),
      data: activityData
    });
  }, [hasStartedStudying, isSessionActive, startStudySession, currentSession, config.activityType]);

  // Auto-end session after inactivity
  useEffect(() => {
    if (!isSessionActive || !currentSession || !lastActivityTime) return;

    const inactivityTimer = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime.getTime();
      const inactivityThreshold = 10 * 60 * 1000; // 10 minutes

      if (timeSinceLastActivity > inactivityThreshold) {
        console.log('Auto-ending session due to inactivity');
        endSession.mutate(currentSession.id);
        setIsSessionActive(false);
        setCurrentSession(null);
        setHasStartedStudying(false);
      }
    }, 60000); // Check every minute

    return () => clearInterval(inactivityTimer);
  }, [isSessionActive, currentSession, lastActivityTime, endSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSessionActive && currentSession) {
        endSession.mutate(currentSession.id);
      }
    };
  }, []);

  return {
    currentSession,
    isSessionActive,
    hasStartedStudying,
    startStudySession,
    updateSessionWithPerformance,
    recordStudyActivity,
    endSessionManually: () => {
      if (currentSession) {
        endSession.mutate(currentSession.id);
        setIsSessionActive(false);
        setCurrentSession(null);
        setHasStartedStudying(false);
      }
    }
  };
};
