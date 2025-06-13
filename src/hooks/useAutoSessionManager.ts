
import { useState, useEffect, useCallback } from 'react';
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
  const [hasStartedStudying, setHasStartedStudying] = useState(false);
  
  const { user } = useAuth();

  console.log('🚫 [AUTO SESSION MANAGER] DISABLED - All session management now handled by SessionDock to prevent conflicts');
  console.log('🚫 [AUTO SESSION MANAGER] Config received but ignored:', config);

  // DISABLED: All session management functions now return no-ops
  const startStudySession = useCallback(async () => {
    console.log('🚫 [AUTO SESSION MANAGER] startStudySession DISABLED - Use SessionDock instead');
    // Don't create sessions - SessionDock handles this
  }, []);

  const updateSessionWithPerformance = useCallback(async (performanceData: SessionPerformanceUpdate) => {
    console.log('🚫 [AUTO SESSION MANAGER] updateSessionWithPerformance DISABLED - Use SessionDock instead');
    // Don't update sessions - SessionDock handles this
  }, []);

  const recordStudyActivity = useCallback(async (activityData?: Record<string, any>) => {
    console.log('🚫 [AUTO SESSION MANAGER] recordStudyActivity DISABLED - Use SessionDock instead');
    // Don't record activity - SessionDock handles this
  }, []);

  const endSessionManually = useCallback(() => {
    console.log('🚫 [AUTO SESSION MANAGER] endSessionManually DISABLED - Use SessionDock instead');
    // Don't end sessions - SessionDock handles this
  }, []);

  return {
    currentSession: null,
    isSessionActive: false,
    hasStartedStudying: false,
    startStudySession,
    updateSessionWithPerformance,
    recordStudyActivity,
    endSessionManually
  };
};
