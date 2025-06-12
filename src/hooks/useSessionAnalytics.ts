
import { useState, useEffect, useCallback } from 'react';
import { useUnifiedSessionTracker, SessionEventData } from './useUnifiedSessionTracker';
import { logger } from '@/config/environment';

export interface SessionMetrics {
  totalEvents: number;
  sessionStartCount: number;
  sessionEndCount: number;
  pauseCount: number;
  resumeCount: number;
  activityCount: number;
  idleWarnings: number;
  autoPauses: number;
  averageSessionDuration: number;
  longestSession: number;
  shortestSession: number;
  activityDistribution: Record<string, number>;
}

export interface SessionDebugInfo {
  currentSession: {
    id: string | null;
    duration: number;
    isActive: boolean;
    isPaused: boolean;
    activityType: string | null;
    lastActivity: Date | null;
  };
  performance: {
    pendingUpdates: number;
    eventListeners: number;
    memoryUsage?: number;
  };
  eventHistory: SessionEventData[];
}

export const useSessionAnalytics = () => {
  const sessionTracker = useUnifiedSessionTracker();
  const [metrics, setMetrics] = useState<SessionMetrics>({
    totalEvents: 0,
    sessionStartCount: 0,
    sessionEndCount: 0,
    pauseCount: 0,
    resumeCount: 0,
    activityCount: 0,
    idleWarnings: 0,
    autoPauses: 0,
    averageSessionDuration: 0,
    longestSession: 0,
    shortestSession: 0,
    activityDistribution: {}
  });

  const [eventHistory, setEventHistory] = useState<SessionEventData[]>([]);
  const [sessionDurations, setSessionDurations] = useState<number[]>([]);

  // Event tracking
  const trackEvent = useCallback((event: SessionEventData) => {
    setEventHistory(prev => [...prev.slice(-99), event]); // Keep last 100 events
    
    setMetrics(prev => {
      const updated = { ...prev, totalEvents: prev.totalEvents + 1 };
      
      switch (event.type) {
        case 'session_started':
          updated.sessionStartCount++;
          break;
        case 'session_ended':
          updated.sessionEndCount++;
          if (event.data?.duration) {
            setSessionDurations(durations => {
              const newDurations = [...durations, event.data.duration];
              const avg = newDurations.reduce((a, b) => a + b, 0) / newDurations.length;
              updated.averageSessionDuration = Math.round(avg);
              updated.longestSession = Math.max(...newDurations);
              updated.shortestSession = Math.min(...newDurations);
              return newDurations.slice(-50); // Keep last 50 session durations
            });
          }
          break;
        case 'session_paused':
          updated.pauseCount++;
          break;
        case 'session_resumed':
          updated.resumeCount++;
          break;
        case 'activity_detected':
          updated.activityCount++;
          if (event.data?.activityType) {
            const type = event.data.activityType;
            updated.activityDistribution = {
              ...updated.activityDistribution,
              [type]: (updated.activityDistribution[type] || 0) + 1
            };
          }
          break;
        case 'idle_warning':
          updated.idleWarnings++;
          break;
        case 'auto_paused':
          updated.autoPauses++;
          break;
      }
      
      return updated;
    });

    // Log analytics event
    logger.info('📈 Session Analytics Event:', {
      type: event.type,
      sessionId: event.sessionId,
      timestamp: event.timestamp.toISOString(),
      data: event.data
    });
  }, []);

  // Subscribe to session events
  useEffect(() => {
    const unsubscribers = [
      sessionTracker.addEventListener('session_started', trackEvent),
      sessionTracker.addEventListener('session_ended', trackEvent),
      sessionTracker.addEventListener('session_paused', trackEvent),
      sessionTracker.addEventListener('session_resumed', trackEvent),
      sessionTracker.addEventListener('activity_detected', trackEvent),
      sessionTracker.addEventListener('idle_warning', trackEvent),
      sessionTracker.addEventListener('auto_paused', trackEvent),
      sessionTracker.addEventListener('visibility_changed', trackEvent)
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [sessionTracker, trackEvent]);

  // Get debug information
  const getDebugInfo = useCallback((): SessionDebugInfo => {
    return {
      currentSession: {
        id: sessionTracker.sessionId,
        duration: sessionTracker.elapsedSeconds,
        isActive: sessionTracker.isActive,
        isPaused: sessionTracker.isPaused,
        activityType: sessionTracker.currentActivity,
        lastActivity: sessionTracker.lastActivityTime
      },
      performance: {
        pendingUpdates: sessionTracker.debug.pendingUpdates,
        eventListeners: sessionTracker.debug.eventListeners,
        memoryUsage: (performance as any)?.memory?.usedJSHeapSize
      },
      eventHistory: eventHistory.slice(-20) // Last 20 events
    };
  }, [sessionTracker, eventHistory]);

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    const data = {
      metrics,
      debugInfo: getDebugInfo(),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-analytics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [metrics, getDebugInfo]);

  // Clear analytics data
  const clearAnalytics = useCallback(() => {
    setMetrics({
      totalEvents: 0,
      sessionStartCount: 0,
      sessionEndCount: 0,
      pauseCount: 0,
      resumeCount: 0,
      activityCount: 0,
      idleWarnings: 0,
      autoPauses: 0,
      averageSessionDuration: 0,
      longestSession: 0,
      shortestSession: 0,
      activityDistribution: {}
    });
    setEventHistory([]);
    setSessionDurations([]);
  }, []);

  return {
    metrics,
    debugInfo: getDebugInfo(),
    eventHistory,
    exportAnalytics,
    clearAnalytics
  };
};
