
import { useConsolidatedAnalytics } from './useConsolidatedAnalytics';
import { sanitizeAnalyticsData } from './useGlobalSessionTracker/sessionValidation';

export const useDashboardAnalytics = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  // Sanitize analytics data before using it
  const sanitizedAnalytics = sanitizeAnalyticsData(analytics);

  // Use consolidated analytics data directly
  const todaysActivity = {
    cardsReviewed: 0, // TODO: Add cards reviewed today calculation from sessions
    studyTime: sanitizedAnalytics.todayStudyTimeMinutes, // Use minutes from consolidated analytics
    quizzesTaken: 0 // TODO: Add quizzes taken today calculation from sessions
  };

  // Current streak from consolidated analytics
  const currentStreak = sanitizedAnalytics.streakDays;

  // Weekly comparison using consolidated data
  const weeklyComparison = {
    thisWeek: sanitizedAnalytics.weeklyStudyTimeMinutes,
    lastWeek: sanitizedAnalytics.previousWeekTimeMinutes,
    trend: sanitizedAnalytics.weeklyChange > 0 ? 'up' : sanitizedAnalytics.weeklyChange < 0 ? 'down' : 'stable',
    percentageChange: sanitizedAnalytics.weeklyChange
  };

  // Transform consolidated analytics for dashboard display
  const dashboardData = {
    totalSessions: sanitizedAnalytics.totalSessions,
    totalStudyTime: sanitizedAnalytics.totalStudyTime, // Hours
    totalStudyTimeMinutes: sanitizedAnalytics.totalStudyTimeMinutes, // Minutes
    todayStudyTimeMinutes: sanitizedAnalytics.todayStudyTimeMinutes, // Today in minutes
    weeklyStudyTimeMinutes: sanitizedAnalytics.weeklyStudyTimeMinutes, // Week in minutes
    totalCardsMastered: sanitizedAnalytics.totalCardsMastered,
    flashcardAccuracy: sanitizedAnalytics.flashcardAccuracy,
    todaysActivity,
    currentStreak,
    weeklyComparison,
    weeklyGoalProgress: sanitizedAnalytics.weeklyGoalProgress,
    isLoading
  };

  console.log('📊 Dashboard Analytics (sanitized):', {
    todayStudyTimeMinutes: dashboardData.todayStudyTimeMinutes,
    totalStudyTimeMinutes: dashboardData.totalStudyTimeMinutes,
    weeklyStudyTimeMinutes: dashboardData.weeklyStudyTimeMinutes
  });

  return dashboardData;
};
