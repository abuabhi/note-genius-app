
import { useState, useEffect, useCallback } from 'react';
import { useEnhancedStudySessions } from './useEnhancedStudySessions';

interface StudyTimeTrackerState {
  isActive: boolean;
  isPaused: boolean;
  startTime: Date | null;
  elapsedTime: number;
  sessionId: string | null;
}

export const useStudyTimeTracker = (
  activityType: 'note' | 'flashcard' | 'quiz',
  resourceId?: string,
  resourceName?: string
) => {
  const [state, setState] = useState<StudyTimeTrackerState>({
    isActive: false,
    isPaused: false,
    startTime: null,
    elapsedTime: 0,
    sessionId: null
  });

  const { createAutoSession, updateSessionPerformance, endSession } = useEnhancedStudySessions();

  // Start tracking
  const startTracking = useCallback(async () => {
    if (state.isActive) return;

    const now = new Date();
    
    // Create auto session
    const session = await createAutoSession.mutateAsync({
      activity_type: activityType,
      title: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Study Session`,
      subject: resourceName,
      resource_id: resourceId
    });

    if (session) {
      setState(prev => ({
        ...prev,
        isActive: true,
        isPaused: false,
        startTime: now,
        sessionId: session.id
      }));
    }
  }, [state.isActive, activityType, resourceName, resourceId, createAutoSession]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    if (!state.isActive || !state.sessionId) return;

    await endSession.mutateAsync(state.sessionId);
    
    setState({
      isActive: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      sessionId: null
    });
  }, [state.isActive, state.sessionId, endSession]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  // Update elapsed time
  useEffect(() => {
    if (!state.isActive || state.isPaused || !state.startTime) return;

    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - prev.startTime!.getTime()) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isActive, state.isPaused, state.startTime]);

  // Update session performance periodically
  useEffect(() => {
    if (!state.sessionId || !state.isActive || state.isPaused) return;

    const interval = setInterval(() => {
      const performanceData: any = {};
      
      if (activityType === 'note') {
        performanceData.notes_reviewed = 1;
      }
      
      updateSessionPerformance.mutate({
        sessionId: state.sessionId!,
        ...performanceData
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [state.sessionId, state.isActive, state.isPaused, activityType, updateSessionPerformance]);

  return {
    ...state,
    startTracking,
    stopTracking,
    togglePause,
    isLoading: createAutoSession.isPending || endSession.isPending
  };
};
