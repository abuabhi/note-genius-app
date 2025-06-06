
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
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
  
  const { user } = useAuth();
  const { createAutoSession, updateSessionPerformance, endSession } = useEnhancedStudySessions();
  const { adaptiveLearningInsights } = useAdaptiveLearning();

  // Auto-create session when component mounts with activity
  const initializeSession = useCallback(async () => {
    if (!user || isSessionActive) return;

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
      
      console.log('Auto-created study session:', result.id);
    } catch (error) {
      console.error('Failed to create auto session:', error);
    }
  }, [user, config, isSessionActive, createAutoSession]);

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

  // Record activity to reset inactivity timer
  const recordActivity = useCallback((activityData?: Record<string, any>) => {
    setLastActivityTime(new Date());
    
    // Log activity for adaptive learning analysis
    console.log('Activity recorded:', {
      sessionId: currentSession?.id,
      activityType: config.activityType,
      timestamp: new Date().toISOString(),
      data: activityData
    });
  }, [currentSession, config.activityType]);

  // Auto-end session after inactivity
  useEffect(() => {
    if (!isSessionActive || !currentSession) return;

    const inactivityTimer = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime.getTime();
      const inactivityThreshold = 10 * 60 * 1000; // 10 minutes

      if (timeSinceLastActivity > inactivityThreshold) {
        console.log('Auto-ending session due to inactivity');
        endSession.mutate(currentSession.id);
        setIsSessionActive(false);
        setCurrentSession(null);
      }
    }, 60000); // Check every minute

    return () => clearInterval(inactivityTimer);
  }, [isSessionActive, currentSession, lastActivityTime, endSession]);

  // Initialize session on mount
  useEffect(() => {
    if (user && !isSessionActive) {
      initializeSession();
    }
  }, [user, initializeSession, isSessionActive]);

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
    initializeSession,
    updateSessionWithPerformance,
    recordActivity,
    endSessionManually: () => {
      if (currentSession) {
        endSession.mutate(currentSession.id);
        setIsSessionActive(false);
        setCurrentSession(null);
      }
    }
  };
};
