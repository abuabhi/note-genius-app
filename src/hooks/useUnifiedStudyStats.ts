
import { useAnalytics } from '@/contexts/AnalyticsContext';

export const useUnifiedStudyStats = () => {
  const { analytics, isLoading } = useAnalytics();
  
  // Transform to match expected interface
  const stats = {
    totalSessions: analytics.totalSessions,
    todaySessions: Math.floor(analytics.todayStudyTimeMinutes / 30), // Estimate based on avg session
    weeklySessions: Math.floor(analytics.weeklyStudyTimeMinutes / 30),
    studyTimeHours: analytics.totalStudyTime,
    studyTimeMinutes: analytics.totalStudyTimeMinutes,
    todayStudyTimeMinutes: analytics.todayStudyTimeMinutes,
    weeklyStudyTimeMinutes: analytics.weeklyStudyTimeMinutes,
    averageSessionTime: analytics.averageSessionTime,
    streakDays: analytics.streakDays,
    totalCardsMastered: analytics.totalCardsMastered,
    recentSessions: analytics.recentSessions,
    totalSets: analytics.totalSets,
    flashcardAccuracy: analytics.flashcardAccuracy,
    weeklyGoalProgress: analytics.weeklyGoalProgress,
    weeklyGoalMinutes: analytics.weeklyGoalMinutes,
    weeklyChange: analytics.weeklyChange,
    timezone: analytics.timezone,
    todayString: analytics.todayString,
  };
  
  return { stats, isLoading };
};
