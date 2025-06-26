
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUnifiedSessionTracker } from './useUnifiedSessionTracker';

interface RealTimeMetrics {
  focusLevel: number; // 0-100
  responseTime: number; // milliseconds
  accuracyRate: number; // 0-100
  engagementLevel: number; // 0-100
  sessionQuality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  strugglingIndicator: boolean;
  excellingIndicator: boolean;
}

interface SessionActivity {
  timestamp: number;
  activityType: 'card_flip' | 'answer_correct' | 'answer_incorrect' | 'idle' | 'navigation';
  responseTime?: number;
  metadata?: Record<string, any>;
}

export const useRealTimeSessionTracker = () => {
  const { recordActivity, isActive } = useUnifiedSessionTracker();
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    focusLevel: 100,
    responseTime: 0,
    accuracyRate: 100,
    engagementLevel: 100,
    sessionQuality: 'excellent',
    strugglingIndicator: false,
    excellingIndicator: false,
  });

  const [activities, setActivities] = useState<SessionActivity[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const responseTimesRef = useRef<number[]>([]);
  const correctAnswersRef = useRef<number>(0);
  const totalAnswersRef = useRef<number>(0);

  // Start tracking when session becomes active
  useEffect(() => {
    if (isActive) {
      setIsTracking(true);
      lastActivityRef.current = Date.now();
      console.log('🔄 [REAL-TIME TRACKER] Started tracking session metrics');
    } else {
      setIsTracking(false);
    }
  }, [isActive]);

  // Monitor for idle periods to detect focus drops
  useEffect(() => {
    if (!isTracking) return;

    const idleCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Update focus level based on activity recency
      let newFocusLevel = 100;
      if (timeSinceLastActivity > 30000) { // 30 seconds
        newFocusLevel = Math.max(20, 100 - (timeSinceLastActivity / 1000) * 2);
      }

      setMetrics(prev => ({
        ...prev,
        focusLevel: newFocusLevel,
        engagementLevel: Math.min(prev.engagementLevel, newFocusLevel),
      }));
    }, 5000);

    return () => clearInterval(idleCheckInterval);
  }, [isTracking]);

  const recordSessionActivity = useCallback((
    activityType: SessionActivity['activityType'],
    responseTime?: number,
    metadata?: Record<string, any>
  ) => {
    if (!isTracking) return;

    const now = Date.now();
    lastActivityRef.current = now;

    const activity: SessionActivity = {
      timestamp: now,
      activityType,
      responseTime,
      metadata,
    };

    setActivities(prev => [...prev.slice(-50), activity]); // Keep last 50 activities
    recordActivity(); // Record with unified tracker

    // Update metrics based on activity
    if (responseTime && responseTime > 0) {
      responseTimesRef.current = [...responseTimesRef.current.slice(-20), responseTime];
      
      setMetrics(prev => ({
        ...prev,
        responseTime: responseTimesRef.current.reduce((a, b) => a + b, 0) / responseTimesRef.current.length,
      }));
    }

    console.log('📊 [REAL-TIME TRACKER] Recorded activity:', activityType, { responseTime, metadata });
  }, [isTracking, recordActivity]);

  const recordAnswer = useCallback((isCorrect: boolean, responseTime?: number) => {
    totalAnswersRef.current++;
    if (isCorrect) {
      correctAnswersRef.current++;
    }

    const accuracyRate = (correctAnswersRef.current / totalAnswersRef.current) * 100;
    
    recordSessionActivity(
      isCorrect ? 'answer_correct' : 'answer_incorrect',
      responseTime,
      { isCorrect, totalAnswers: totalAnswersRef.current }
    );

    // Calculate performance indicators
    const struggling = accuracyRate < 60 && totalAnswersRef.current > 5;
    const excelling = accuracyRate > 85 && totalAnswersRef.current > 3;

    // Determine session quality
    let sessionQuality: RealTimeMetrics['sessionQuality'] = 'good';
    if (accuracyRate >= 90) sessionQuality = 'excellent';
    else if (accuracyRate >= 70) sessionQuality = 'good';
    else if (accuracyRate >= 50) sessionQuality = 'needs_improvement';
    else sessionQuality = 'poor';

    setMetrics(prev => ({
      ...prev,
      accuracyRate,
      sessionQuality,
      strugglingIndicator: struggling,
      excellingIndicator: excelling,
      engagementLevel: Math.min(100, prev.engagementLevel + (isCorrect ? 2 : -3)),
    }));
  }, [recordSessionActivity]);

  const getRecentPerformanceTrend = useCallback(() => {
    const recentAnswers = activities
      .filter(a => a.activityType === 'answer_correct' || a.activityType === 'answer_incorrect')
      .slice(-10);
    
    if (recentAnswers.length < 3) return 'stable';
    
    const correctCount = recentAnswers.filter(a => a.activityType === 'answer_correct').length;
    const accuracy = correctCount / recentAnswers.length;
    
    if (accuracy > 0.8) return 'improving';
    if (accuracy < 0.4) return 'declining';
    return 'stable';
  }, [activities]);

  const resetSession = useCallback(() => {
    setActivities([]);
    responseTimesRef.current = [];
    correctAnswersRef.current = 0;
    totalAnswersRef.current = 0;
    lastActivityRef.current = Date.now();
    
    setMetrics({
      focusLevel: 100,
      responseTime: 0,
      accuracyRate: 100,
      engagementLevel: 100,
      sessionQuality: 'excellent',
      strugglingIndicator: false,
      excellingIndicator: false,
    });
  }, []);

  return {
    metrics,
    activities,
    isTracking,
    recordSessionActivity,
    recordAnswer,
    getRecentPerformanceTrend,
    resetSession,
  };
};
