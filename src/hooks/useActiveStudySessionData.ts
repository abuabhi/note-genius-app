
import { useMemo } from 'react';
import { useActiveStudyPlans } from './useActiveStudyPlans';
import { useStudyPlanSession } from './useStudyPlanSession';
import { useSessionStats } from './useSessionStats';

export interface ActiveStudySessionData {
  hasActivePlans: boolean;
  currentActivePlan: any | null;
  todayProgress: {
    sessionsCompleted: number;
    timeStudiedMinutes: number;
    targetTimeMinutes: number;
    completionPercentage: number;
  };
  streakDays: number;
  nextStudySession: {
    planTitle: string;
    timeRemaining: string;
    isOverdue: boolean;
  } | null;
  urgentAction: 'continue_session' | 'start_today' | 'maintain_streak' | 'celebrate' | null;
  motivationalMessage: string;
}

export const useActiveStudySessionData = (): ActiveStudySessionData => {
  const { studyPlans, isLoading: plansLoading } = useActiveStudyPlans();
  const { isAnySessionActive, getActiveStudyPlanId } = useStudyPlanSession();
  const { todayStudyTimeMinutes, totalSessions } = useSessionStats();

  const data = useMemo((): ActiveStudySessionData => {
    if (plansLoading) {
      return {
        hasActivePlans: false,
        currentActivePlan: null,
        todayProgress: { sessionsCompleted: 0, timeStudiedMinutes: 0, targetTimeMinutes: 0, completionPercentage: 0 },
        streakDays: 0,
        nextStudySession: null,
        urgentAction: null,
        motivationalMessage: "Loading your study progress..."
      };
    }

    const hasActivePlans = studyPlans.length > 0;
    const activeStudyPlanId = getActiveStudyPlanId();
    const currentActivePlan = activeStudyPlanId 
      ? studyPlans.find(plan => plan.id === activeStudyPlanId) 
      : null;

    // Calculate today's progress
    const targetTimeMinutes = hasActivePlans 
      ? studyPlans.reduce((total, plan) => total + plan.daily_duration_minutes, 0)
      : 60; // Default 1 hour target

    const completionPercentage = targetTimeMinutes > 0 
      ? Math.min(100, (todayStudyTimeMinutes / targetTimeMinutes) * 100)
      : 0;

    // Determine urgent action
    let urgentAction: ActiveStudySessionData['urgentAction'] = null;
    let motivationalMessage = "Ready to learn something new today?";

    if (isAnySessionActive && currentActivePlan) {
      urgentAction = 'continue_session';
      motivationalMessage = `Keep going! You're in the zone with ${currentActivePlan.title}`;
    } else if (hasActivePlans && completionPercentage < 50 && new Date().getHours() > 18) {
      urgentAction = 'start_today';
      motivationalMessage = "Don't let today slip by! A quick study session can make all the difference.";
    } else if (hasActivePlans && completionPercentage === 0 && new Date().getHours() < 12) {
      urgentAction = 'start_today';
      motivationalMessage = "Good morning! Start your day with focused learning.";
    } else if (completionPercentage >= 100) {
      urgentAction = 'celebrate';
      motivationalMessage = "Amazing! You've hit your daily study goal. Keep the momentum going!";
    } else if (hasActivePlans && completionPercentage > 0) {
      motivationalMessage = `Great progress! You're ${Math.round(completionPercentage)}% towards your daily goal.`;
    }

    // Find next study session (simplified - pick first active plan)
    const nextPlan = hasActivePlans ? studyPlans[0] : null;
    const nextStudySession = nextPlan ? {
      planTitle: nextPlan.title,
      timeRemaining: "Ready now",
      isOverdue: false
    } : null;

    return {
      hasActivePlans,
      currentActivePlan,
      todayProgress: {
        sessionsCompleted: totalSessions,
        timeStudiedMinutes: todayStudyTimeMinutes,
        targetTimeMinutes,
        completionPercentage: Math.round(completionPercentage)
      },
      streakDays: 0, // Will implement streak calculation later
      nextStudySession,
      urgentAction,
      motivationalMessage
    };
  }, [studyPlans, plansLoading, isAnySessionActive, getActiveStudyPlanId, todayStudyTimeMinutes, totalSessions]);

  return data;
};
