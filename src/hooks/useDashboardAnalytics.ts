
import { useConsolidatedAnalytics } from './useConsolidatedAnalytics';

export const useDashboardAnalytics = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  // Calculate today's activity from actual analytics data
  const todaysActivity = {
    cardsReviewed: 0, // TODO: Add cards reviewed today calculation from sessions
    studyTime: Math.round(analytics.todayStudyTime * 60), // Convert hours to minutes
    quizzesTaken: 0 // TODO: Add quizzes taken today calculation from sessions
  };

  // Calculate current streak (simplified for now)
  const currentStreak = analytics.streakDays;

  // Use weekly data from analytics
  const weeklyComparison = {
    thisWeek: analytics.weeklyStudyTime,
    lastWeek: 0, // TODO: Add last week calculation
    trend: analytics.weeklyStudyTime > 0 ? 'up' : 'stable'
  };

  // Transform consolidated analytics for dashboard display
  const dashboardData = {
    totalSessions: analytics.totalSessions,
    totalStudyTime: analytics.totalStudyTime,
    totalCardsMastered: analytics.totalCardsMastered,
    flashcardAccuracy: analytics.flashcardAccuracy,
    todaysActivity,
    currentStreak,
    weeklyComparison,
    isLoading
  };

  return dashboardData;
};
