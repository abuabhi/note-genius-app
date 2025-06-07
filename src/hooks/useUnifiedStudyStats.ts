
import { useTimezoneAwareAnalytics } from './useTimezoneAwareAnalytics';

export const useUnifiedStudyStats = () => {
  const { analytics, isLoading } = useTimezoneAwareAnalytics();

  // Transform timezone-aware analytics to unified format
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
    activeSessions: analytics.activeSessions,
    
    // Timezone info
    timezone: analytics.timezone,
    todayString: analytics.todayString
  };

  return { stats, isLoading };
};
