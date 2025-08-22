
import { useUnifiedAnalytics } from './useUnifiedAnalytics';
import { useTimezone } from './useTimezone';
import { useRequireAuth } from './useRequireAuth';
import { useMemo } from 'react';

export const useTimezoneAwareAnalytics = () => {
  const { analytics, isLoading: analyticsLoading } = useUnifiedAnalytics();
  const { timezone, isLoading: timezoneLoading } = useTimezone();
  const { userProfile } = useRequireAuth();

  // Console logging removed for production performance

  // Get today's date in user's timezone for filtering
  const todayString = useMemo(() => {
    if (!timezone) return new Date().toISOString().split('T')[0];
    
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date());
    } catch (error) {
      console.error('Error formatting date for timezone:', error);
      return new Date().toISOString().split('T')[0];
    }
  }, [timezone]);

  // Enhanced analytics with timezone awareness and profile data
  const enhancedAnalytics = useMemo(() => {
    // Access weekly_study_goal_hours from userProfile, with fallback to 5
    const weeklyGoalHours = (userProfile as any)?.weekly_study_goal_hours || 5;
    const weeklyGoalMinutes = weeklyGoalHours * 60;
    
    // Calculate weekly goal progress
    const weeklyGoalProgress = analytics.weeklyStudyTimeMinutes > 0 
      ? Math.min(100, Math.round((analytics.weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100))
      : 0;

    // Calculate previous week time (simplified)
    const previousWeekTimeMinutes = Math.max(0, analytics.weeklyStudyTimeMinutes - 50); // Placeholder calculation

    return {
      ...analytics,
      // Goal tracking
      weeklyGoalMinutes,
      weeklyGoalHours,
      weeklyGoalProgress,
      previousWeekTimeMinutes,
      
      // Timezone and date info
      timezone,
      todayString,
    };
  }, [analytics, userProfile, todayString, timezone]);

  const isLoading = analyticsLoading || timezoneLoading;

  return {
    analytics: enhancedAnalytics,
    timezone,
    isLoading
  };
};
