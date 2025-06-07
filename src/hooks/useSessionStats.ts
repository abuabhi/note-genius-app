
import { useUnifiedStudyStats } from './useUnifiedStudyStats';

export const useSessionStats = () => {
  const { stats, isLoading } = useUnifiedStudyStats();

  // Provide consistent session statistics for all components
  return {
    // Session counts
    totalSessions: stats.totalSessions,
    todaySessions: stats.todaySessions, 
    weeklySessions: stats.weeklySessions,
    
    // Time metrics (always use the same source)
    totalStudyTime: stats.studyTimeHours,
    totalStudyTimeMinutes: stats.studyTimeMinutes,
    todayStudyTimeMinutes: stats.todayStudyTimeMinutes,
    weeklyStudyTimeMinutes: stats.weeklyStudyTimeMinutes,
    
    // Recent session data
    recentSessions: stats.recentSessions,
    
    // Loading state
    isLoading
  };
};
