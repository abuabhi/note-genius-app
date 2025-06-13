
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
    
    // Goal tracking - now uses user's actual goal
    weeklyGoalProgress: analytics.weeklyGoalProgress,
    weeklyGoalMinutes: analytics.weeklyGoalMinutes,
    weeklyGoalHours: analytics.weeklyGoalHours,
    weeklyChange: analytics.weeklyChange,
    
    // Quiz metrics - NEW
    totalQuizzes: analytics.totalQuizzes,
    completedQuizzes: analytics.completedQuizzes,
    
    // Notes metrics - NEW  
    totalNotes: analytics.totalNotes,
    
    // Flashcard metrics - ensure we're getting the correct mastered cards count
    totalCardsMastered: analytics.totalCardsMastered, // This should come from timezone-aware analytics
    totalSets: analytics.totalSets,
    totalCardsReviewed: analytics.totalCardsReviewed,
    flashcardAccuracy: analytics.flashcardAccuracy,
    
    // Streak and trends - now properly calculated
    streakDays: analytics.streakDays,
    
    // Session data - add the missing recentSessions property
    recentSessions: analytics.recentSessions,
    
    // Timezone info
    timezone: analytics.timezone,
    todayString: analytics.todayString
  };

  console.log('🔄 Consolidated Analytics:', {
    totalQuizzes: consolidatedAnalytics.totalQuizzes,
    completedQuizzes: consolidatedAnalytics.completedQuizzes,
    totalNotes: consolidatedAnalytics.totalNotes,
    streakDays: consolidatedAnalytics.streakDays,
    weeklyGoalHours: consolidatedAnalytics.weeklyGoalHours,
    source: 'useConsolidatedAnalytics'
  });

  return { 
    analytics: consolidatedAnalytics, 
    isLoading 
  };
};
