import { useCallback } from 'react';
import { googleAnalyticsService } from '@/services/analytics/GoogleAnalyticsService';
import { userSessionTracker } from '@/services/analytics/UserSessionTracker';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * Enhanced analytics hook for tracking goal and achievement activities
 */
export const useGoalAnalytics = () => {
  const { user } = useAuth();

  // Track goal creation
  const trackGoalCreated = useCallback((
    goalType: 'daily_time' | 'weekly_time' | 'cards_reviewed' | 'accuracy_target',
    goalValue: number,
    subject?: string,
    deadline?: string
  ) => {
    googleAnalyticsService.trackGoalEvent('goal_created', {
      goal_type: goalType,
      goal_value: goalValue,
      study_subject: subject,
      custom_parameter_1: deadline
    });

    // Track feature discovery
    googleAnalyticsService.trackEvent('feature_discovered', {
      event_category: 'Goal Setting',
      event_label: goalType,
      value: goalValue
    });
  }, []);

  // Track goal achievement
  const trackGoalAchieved = useCallback((
    goalType: 'daily_time' | 'weekly_time' | 'cards_reviewed' | 'accuracy_target',
    goalValue: number,
    actualValue: number,
    achievementPercentage: number,
    daysToAchieve?: number
  ) => {
    googleAnalyticsService.trackGoalEvent('goal_achieved', {
      goal_type: goalType,
      goal_value: goalValue,
      achievement_percentage: achievementPercentage,
      value: actualValue,
      custom_parameter_1: daysToAchieve?.toString()
    });

    // Track as conversion event
    googleAnalyticsService.trackConversion('goal_completion', achievementPercentage);

    // Track streak milestone if applicable
    if (goalType === 'daily_time' && daysToAchieve && daysToAchieve > 1) {
      googleAnalyticsService.trackEvent('study_streak_milestone', {
        event_category: 'Achievement',
        streak_days: daysToAchieve,
        goal_type: goalType
      });
    }
  }, []);

  // Track daily goal progress
  const trackDailyGoalProgress = useCallback((
    goalType: 'daily_time' | 'cards_reviewed' | 'accuracy_target',
    progress: number,
    target: number,
    isComplete: boolean = false
  ) => {
    const progressPercentage = Math.round((progress / target) * 100);

    if (isComplete) {
      googleAnalyticsService.trackEvent('daily_goal_reached', {
        event_category: 'Achievement',
        goal_type: goalType,
        goal_value: target,
        achievement_percentage: progressPercentage
      });
    }

    // Track milestone progress (25%, 50%, 75%)
    const milestones = [25, 50, 75];
    milestones.forEach(milestone => {
      if (progressPercentage >= milestone && progressPercentage < milestone + 25) {
        googleAnalyticsService.trackEvent('goal_achieved', {
          goal_type: goalType,
          achievement_percentage: milestone,
          custom_parameter_1: 'daily_progress'
        });
      }
    });
  }, []);

  // Track weekly goal progress
  const trackWeeklyGoalProgress = useCallback((
    weeklyStudyTime: number,
    weeklyGoal: number,
    currentDay: number // 1-7 (Monday to Sunday)
  ) => {
    const progressPercentage = Math.round((weeklyStudyTime / weeklyGoal) * 100);
    const isComplete = progressPercentage >= 100;

    if (isComplete) {
      googleAnalyticsService.trackEvent('weekly_goal_reached', {
        event_category: 'Achievement',
        goal_type: 'weekly_time',
        goal_value: weeklyGoal,
        achievement_percentage: progressPercentage,
        custom_parameter_1: currentDay.toString()
      });
    }

    // Track if they're on track (based on day of week)
    const expectedProgress = (currentDay / 7) * 100;
    const isOnTrack = progressPercentage >= expectedProgress * 0.8; // 80% of expected

    if (isOnTrack && currentDay >= 3) { // Only track after Tuesday
      googleAnalyticsService.trackEvent('goal_achieved', {
        goal_type: 'weekly_time',
        achievement_percentage: progressPercentage,
        custom_parameter_1: 'on_track',
        custom_parameter_2: currentDay.toString()
      });
    }
  }, []);

  // Track study streak milestones
  const trackStudyStreakMilestone = useCallback((
    streakDays: number,
    streakType: 'daily_login' | 'daily_study' | 'goal_completion'
  ) => {
    googleAnalyticsService.trackEvent('study_streak_milestone', {
      event_category: 'Achievement',
      streak_days: streakDays,
      custom_parameter_1: streakType
    });

    // Track specific milestone achievements
    const milestones = [3, 7, 14, 30, 60, 100];
    if (milestones.includes(streakDays)) {
      googleAnalyticsService.trackConversion('streak_milestone', streakDays);
    }
  }, []);

  // Track daily login streaks
  const trackDailyLogin = useCallback((
    streakDays: number,
    isNewStreak: boolean = false,
    lastLoginDays?: number
  ) => {
    googleAnalyticsService.trackEvent('daily_login', {
      event_category: 'User Engagement',
      streak_days: streakDays,
      custom_parameter_1: isNewStreak ? 'new_streak' : 'continuing',
      custom_parameter_2: lastLoginDays?.toString()
    });

    // Track return after absence
    if (lastLoginDays && lastLoginDays > 7) {
      googleAnalyticsService.trackEvent('return_after_absence', {
        event_category: 'User Engagement',
        value: lastLoginDays,
        streak_days: streakDays
      });
    }
  }, []);

  // Track goal modification/updates
  const trackGoalUpdated = useCallback((
    goalType: 'daily_time' | 'weekly_time' | 'cards_reviewed' | 'accuracy_target',
    oldValue: number,
    newValue: number,
    reason?: 'too_easy' | 'too_hard' | 'schedule_change'
  ) => {
    googleAnalyticsService.trackGoalEvent('goal_created', { // Reusing event for goal updates
      goal_type: goalType,
      goal_value: newValue,
      custom_parameter_1: `updated_from_${oldValue}`,
      custom_parameter_2: reason || 'unspecified'
    });
  }, []);

  return {
    trackGoalCreated,
    trackGoalAchieved,
    trackDailyGoalProgress,
    trackWeeklyGoalProgress,
    trackStudyStreakMilestone,
    trackDailyLogin,
    trackGoalUpdated
  };
};