
import { useSimpleAnalytics } from './useSimpleAnalytics';

export const useDashboardAnalytics = () => {
  const { analytics, isLoading } = useSimpleAnalytics();

  const todaysActivity = {
    cardsReviewed: 0,
    studyTime: analytics.todayStudyTimeMinutes,
    quizzesTaken: 0
  };

  const currentStreak = analytics.streakDays;

  const weeklyComparison = {
    thisWeek: analytics.weeklyStudyTimeMinutes,
    lastWeek: analytics.previousWeekTimeMinutes,
    trend: 'stable' as const,
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
