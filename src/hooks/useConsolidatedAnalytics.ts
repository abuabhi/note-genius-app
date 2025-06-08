
import { useTimezoneAwareAnalytics } from './useTimezoneAwareAnalytics';

export const useConsolidatedAnalytics = () => {
  const { analytics, isLoading } = useTimezoneAwareAnalytics();

  // Transform timezone-aware analytics to consolidated format
  const consolidatedAnalytics = {
    // Session metrics
    totalSessions: analytics.totalSessions,
    todaySessions: analytics.todaySessions,
    weeklySessions: analytics.weeklySessions,
    averageSessionTime: analytics.averageSessionTime,
    
    // Time metrics
    totalStudyTime: analytics.totalStudyTime,
    totalStudyTimeMinutes: analytics.totalStudyTimeMinutes,
    todayStudyTime: analytics.todayStudyTime,
    todayStudyTimeMinutes: analytics.todayStudyTimeMinutes,
    weeklyStudyTime: analytics.weeklyStudyTime,
    weeklyStudyTimeMinutes: analytics.weeklyStudyTimeMinutes,
    previousWeekTimeMinutes: analytics.previousWeekTimeMinutes,
    
    // Goal tracking
    weeklyGoalProgress: analytics.weeklyGoalProgress,
    weeklyGoalMinutes: analytics.weeklyGoalMinutes,
    weeklyChange: analytics.weeklyChange,
    
    // Flashcard metrics - ensure we're getting the correct mastered cards count
    totalCardsMastered: analytics.totalCardsMastered, // This should come from timezone-aware analytics
    totalSets: analytics.totalSets,
    totalCardsReviewed: analytics.totalCardsReviewed,
    flashcardAccuracy: analytics.flashcardAccuracy,
    
    // Streak and trends
    streakDays: analytics.streakDays,
    
    // Timezone info
    timezone: analytics.timezone,
    todayString: analytics.todayString
  };

  console.log('🔄 Consolidated Analytics:', {
    totalCardsMastered: consolidatedAnalytics.totalCardsMastered,
    totalSets: consolidatedAnalytics.totalSets,
    flashcardAccuracy: consolidatedAnalytics.flashcardAccuracy,
    source: 'useConsolidatedAnalytics'
  });

  return { 
    analytics: consolidatedAnalytics, 
    isLoading 
  };
};
