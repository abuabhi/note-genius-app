
import { useMemo } from 'react';
import { useTimezoneAwareAnalytics } from './useTimezoneAwareAnalytics';

// Stable stats hook to prevent infinite re-renders
export const useStableStats = () => {
  const { analytics, isLoading } = useTimezoneAwareAnalytics();

  // Memoize the stats object to prevent constant re-creation
  const stableStats = useMemo(() => ({
    // Session metrics
    totalSessions: analytics.totalSessions,
    todaySessions: analytics.todaySessions,
    weeklySessions: analytics.weeklySessions,
    averageSessionTime: analytics.averageSessionTime,
    
    // Time metrics - provide both hours and minutes
    studyTimeHours: analytics.totalStudyTime,
    studyTimeMinutes: analytics.totalStudyTimeMinutes,
    todayStudyTimeMinutes: analytics.todayStudyTimeMinutes,
    weeklyStudyTimeMinutes: analytics.weeklyStudyTimeMinutes,
    
    // Goal tracking
    weeklyGoalProgress: analytics.weeklyGoalProgress,
    weeklyGoalMinutes: analytics.weeklyGoalMinutes,
    
    // Performance metrics
    flashcardAccuracy: analytics.flashcardAccuracy,
    totalCardsMastered: analytics.totalCardsMastered,
    totalSets: analytics.totalSets,
    totalCardsReviewed: analytics.totalCardsReviewed,
    
    // Streak and trends
    streakDays: analytics.streakDays,
    weeklyChange: analytics.weeklyChange,
    
    // Session data
    recentSessions: analytics.recentSessions,
    activeSessions: analytics.activeSessions,
    
    // Timezone info
    timezone: analytics.timezone,
    todayString: analytics.todayString
  }), [
    analytics.totalSessions,
    analytics.todaySessions,
    analytics.weeklySessions,
    analytics.averageSessionTime,
    analytics.totalStudyTime,
    analytics.totalStudyTimeMinutes,
    analytics.todayStudyTimeMinutes,
    analytics.weeklyStudyTimeMinutes,
    analytics.weeklyGoalProgress,
    analytics.weeklyGoalMinutes,
    analytics.flashcardAccuracy,
    analytics.totalCardsMastered,
    analytics.totalSets,
    analytics.totalCardsReviewed,
    analytics.streakDays,
    analytics.weeklyChange,
    analytics.recentSessions,
    analytics.activeSessions,
    analytics.timezone,
    analytics.todayString
  ]);

  return { stats: stableStats, isLoading };
};
