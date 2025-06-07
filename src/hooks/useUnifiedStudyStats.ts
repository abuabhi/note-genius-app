
import { useConsolidatedAnalytics } from './useConsolidatedAnalytics';

export const useUnifiedStudyStats = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  // Transform consolidated analytics to unified format
  const stats = {
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
    activeSessions: analytics.activeSessions
  };

  return { stats, isLoading };
};
