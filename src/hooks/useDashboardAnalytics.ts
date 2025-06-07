
import { useConsolidatedAnalytics } from './useConsolidatedAnalytics';

export const useDashboardAnalytics = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  // Transform consolidated analytics for dashboard display
  const dashboardData = {
    totalSessions: analytics.totalSessions,
    totalStudyTime: analytics.totalStudyTime,
    totalCardsMastered: analytics.totalCardsMastered,
    flashcardAccuracy: analytics.flashcardAccuracy,
    weeklyComparison: {
      thisWeek: analytics.todayStudyTime,
      trend: analytics.todayStudyTime > 0 ? 'up' : 'stable'
    },
    isLoading
  };

  return dashboardData;
};
