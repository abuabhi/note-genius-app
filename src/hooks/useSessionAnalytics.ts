
import { useState, useCallback } from 'react';
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

export const useSessionAnalytics = () => {
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

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    const data = {
      metrics,
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
  }, [metrics]);

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
  }, []);

  return {
    metrics,
    exportAnalytics,
    clearAnalytics
  };
};
