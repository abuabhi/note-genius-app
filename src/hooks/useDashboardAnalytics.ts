
import { useConsolidatedAnalytics } from './useConsolidatedAnalytics';

export const useDashboardAnalytics = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  // Calculate today's activity
  const todaysActivity = {
    cardsReviewed: 0, // TODO: Add cards reviewed today calculation
    studyTime: Math.round(analytics.todayStudyTime * 60), // Convert hours to minutes
    quizzesTaken: 0 // TODO: Add quizzes taken today calculation
  };

  // Calculate current streak (simplified for now)
  const currentStreak = analytics.streakDays;

  // Transform consolidated analytics for dashboard display
  const dashboardData = {
    totalSessions: analytics.totalSessions,
    totalStudyTime: analytics.totalStudyTime,
    totalCardsMastered: analytics.totalCardsMastered,
    flashcardAccuracy: analytics.flashcardAccuracy,
    todaysActivity,
    currentStreak,
    weeklyComparison: {
      thisWeek: analytics.todayStudyTime,
      lastWeek: 0, // TODO: Add last week calculation
      trend: analytics.todayStudyTime > 0 ? 'up' : 'stable'
    },
    isLoading
  };

  return dashboardData;
};
