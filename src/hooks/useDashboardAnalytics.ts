
import { useUltraSimpleAnalytics } from './useUltraSimpleAnalytics';

export const useDashboardAnalytics = () => {
  const { analytics, isLoading } = useUltraSimpleAnalytics();

  const todaysActivity = {
    cardsReviewed: 0,
    studyTime: analytics.todayStudyTimeMinutes,
    quizzesTaken: 0
  };

  const currentStreak = analytics.streakDays;

  // Calculate trend based on percentage change
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (analytics.weeklyChange > 5) {
    trend = 'up';
  } else if (analytics.weeklyChange < -5) {
    trend = 'down';
  }

  const weeklyComparison = {
    thisWeek: analytics.weeklyStudyTimeMinutes,
    lastWeek: analytics.previousWeekTimeMinutes,
    trend,
    percentageChange: analytics.weeklyChange
  };

  const dashboardData = {
    totalSessions: analytics.totalSessions,
    totalStudyTime: analytics.totalStudyTime,
    totalStudyTimeMinutes: analytics.totalStudyTimeMinutes,
    todayStudyTimeMinutes: analytics.todayStudyTimeMinutes,
    weeklyStudyTimeMinutes: analytics.weeklyStudyTimeMinutes,
    totalCardsMastered: analytics.totalCardsMastered,
    flashcardAccuracy: analytics.flashcardAccuracy,
    todaysActivity,
    currentStreak,
    weeklyComparison,
    weeklyGoalProgress: analytics.weeklyGoalProgress,
    weeklyGoalHours: analytics.weeklyGoalHours,
    isLoading
  };

  return dashboardData;
};
