
import { useUltraSimpleAnalytics } from './useUltraSimpleAnalytics';

export const useDashboardAnalytics = () => {
  const { analytics, isLoading } = useUltraSimpleAnalytics();

  const todaysActivity = {
    cardsReviewed: 0,
    studyTime: analytics.todayStudyTimeMinutes,
    quizzesTaken: 0
  };

  const currentStreak = analytics.streakDays;

  // Calculate trend based on percentage change
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (analytics.weeklyChange > 5) {
    trend = 'up';
  } else if (analytics.weeklyChange < -5) {
    trend = 'down';
  }

  const weeklyComparison = {
    thisWeek: analytics.weeklyStudyTimeMinutes,
    lastWeek: analytics.previousWeekTimeMinutes,
    trend,
    percentageChange: analytics.weeklyChange
  };

  // Create subjects data for StudySuggestions
  const subjects = [
    {
      name: 'Mathematics',
      completionPercentage: Math.min(100, (analytics.totalStudyTime / 10) * 100), // Mock calculation
      last7DaysTime: analytics.weeklyStudyTimeMinutes,
      sessionsCount: analytics.totalSessions
    },
    {
      name: 'Science', 
      completionPercentage: Math.min(100, (analytics.totalCardsMastered / 50) * 100), // Mock calculation
      last7DaysTime: Math.floor(analytics.weeklyStudyTimeMinutes * 0.3),
      sessionsCount: Math.floor(analytics.totalSessions * 0.4)
    }
  ].filter(subject => subject.completionPercentage > 0 || subject.last7DaysTime > 0);

  const dashboardData = {
    totalSessions: analytics.totalSessions,
    totalStudyTime: analytics.totalStudyTime,
    totalStudyTimeMinutes: analytics.totalStudyTimeMinutes,
    todayStudyTimeMinutes: analytics.todayStudyTimeMinutes,
    weeklyStudyTimeMinutes: analytics.weeklyStudyTimeMinutes,
    totalCardsMastered: analytics.totalCardsMastered,
    flashcardAccuracy: analytics.flashcardAccuracy,
    todaysActivity,
    currentStreak,
    weeklyComparison,
    weeklyGoalProgress: analytics.weeklyGoalProgress,
    weeklyGoalHours: analytics.weeklyGoalHours,
    subjects,
    isLoading
  };

  return dashboardData;
};
