
import { useConsolidatedAnalytics } from './useConsolidatedAnalytics';

export const useDashboardAnalytics = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  // Use consolidated analytics data directly (already validated in the consolidated hook)
  const todaysActivity = {
    cardsReviewed: 0, // TODO: Add cards reviewed today calculation from sessions
    studyTime: analytics.todayStudyTimeMinutes, // Use minutes from consolidated analytics
    quizzesTaken: 0 // TODO: Add quizzes taken today calculation from sessions
  };

  // Current streak from consolidated analytics (now properly calculated)
  const currentStreak = analytics.streakDays;

  // Weekly comparison using consolidated data
  const weeklyComparison = {
    thisWeek: analytics.weeklyStudyTimeMinutes,
    lastWeek: analytics.previousWeekTimeMinutes,
    trend: analytics.weeklyChange > 0 ? 'up' : analytics.weeklyChange < 0 ? 'down' : 'stable',
    percentageChange: analytics.weeklyChange
  };

  // Transform consolidated analytics for dashboard display
  const dashboardData = {
    totalSessions: analytics.totalSessions,
    totalStudyTime: analytics.totalStudyTime, // Hours
    totalStudyTimeMinutes: analytics.totalStudyTimeMinutes, // Minutes
    todayStudyTimeMinutes: analytics.todayStudyTimeMinutes, // Today in minutes
    weeklyStudyTimeMinutes: analytics.weeklyStudyTimeMinutes, // Week in minutes
    totalCardsMastered: analytics.totalCardsMastered,
    flashcardAccuracy: analytics.flashcardAccuracy,
    todaysActivity,
    currentStreak,
    weeklyComparison,
    weeklyGoalProgress: analytics.weeklyGoalProgress,
    weeklyGoalHours: analytics.weeklyGoalHours, // User's actual goal from settings
    isLoading
  };

  console.log('📊 Dashboard Analytics:', {
    todayStudyTimeMinutes: dashboardData.todayStudyTimeMinutes,
    totalStudyTimeMinutes: dashboardData.totalStudyTimeMinutes,
    weeklyStudyTimeMinutes: dashboardData.weeklyStudyTimeMinutes,
    weeklyGoalHours: dashboardData.weeklyGoalHours,
    streakDays: dashboardData.currentStreak
  });

  return dashboardData;
};
