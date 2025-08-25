
import { useAnalytics } from '@/contexts/AnalyticsContext';

export const useSessionStats = () => {
  const { analytics, isLoading } = useAnalytics();

  // Provide consistent session statistics for all components
  return {
    // Session counts
    totalSessions: analytics.totalSessions,
    todaySessions: Math.floor(analytics.todayStudyTimeMinutes / 30), // Estimate
    weeklySessions: Math.floor(analytics.weeklyStudyTimeMinutes / 30),
    
    // Time metrics (always use the same source)
    totalStudyTime: analytics.totalStudyTime,
    totalStudyTimeMinutes: analytics.totalStudyTimeMinutes,
    todayStudyTimeMinutes: analytics.todayStudyTimeMinutes,
    weeklyStudyTimeMinutes: analytics.weeklyStudyTimeMinutes,
    
    // Recent session data
    recentSessions: analytics.recentSessions,
    
    // Loading state
    isLoading
  };
};
