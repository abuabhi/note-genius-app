import { useMemo } from 'react';
import { useUnifiedAnalytics } from './useUnifiedAnalytics';

/**
 * Hook that adds validation and debugging to analytics data
 * Helps catch calculation errors and data inconsistencies
 */
export const useValidatedAnalytics = () => {
  const { analytics, sessions, isLoading } = useUnifiedAnalytics();

  const validatedAnalytics = useMemo(() => {
    if (isLoading || !analytics) return analytics;

    // Validation checks
    const validations = {
      totalStudyTimeValid: analytics.totalStudyTime <= 24 * 365, // Max 1 year of 24/7 study
      weeklyStudyTimeValid: analytics.weeklyStudyTimeMinutes <= 24 * 60 * 7, // Max 7 days * 24 hours
      todayStudyTimeValid: analytics.todayStudyTimeMinutes <= 24 * 60, // Max 24 hours today
      averageSessionValid: analytics.averageSessionTime <= 12 * 60 * 60, // Max 12 hours per session
      accuracyValid: analytics.averageAccuracy >= 0 && analytics.averageAccuracy <= 100,
    };

    // Log validation failures for debugging
    Object.entries(validations).forEach(([key, isValid]) => {
      if (!isValid) {
        console.warn(`🚨 Analytics validation failed for ${key}:`, {
          [key]: analytics[key as keyof typeof analytics],
          sessionsCount: sessions.length,
          completedSessions: sessions.filter(s => !s.is_active && s.duration).length,
        });
      }
    });

    // Cap unrealistic values
    const cappedAnalytics = {
      ...analytics,
      totalStudyTime: Math.min(analytics.totalStudyTime, 24 * 365), // Cap at 1 year
      weeklyStudyTimeMinutes: Math.min(analytics.weeklyStudyTimeMinutes, 24 * 60 * 7),
      todayStudyTimeMinutes: Math.min(analytics.todayStudyTimeMinutes, 24 * 60),
      averageSessionTime: Math.min(analytics.averageSessionTime, 12 * 60 * 60),
      averageAccuracy: Math.max(0, Math.min(100, analytics.averageAccuracy)),
    };

    return cappedAnalytics;
  }, [analytics, sessions, isLoading]);

  return {
    analytics: validatedAnalytics,
    sessions,
    isLoading,
  };
};