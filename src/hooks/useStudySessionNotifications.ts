
import { useEffect, useMemo } from 'react';
import { useActiveStudySessionData } from './useActiveStudySessionData';
import { useOptimizedReminderNotifications } from './reminders/useOptimizedReminderNotifications';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

interface StudySessionNotification {
  id: string;
  type: 'session_reminder' | 'streak_warning' | 'milestone_celebration' | 'gentle_nudge';
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  actionText: string;
  timing: 'immediate' | 'scheduled';
  studyPlanId?: string;
}

export const useStudySessionNotifications = () => {
  const { user } = useAuth();
  const sessionData = useActiveStudySessionData();
  const { reminders, dismissReminder } = useOptimizedReminderNotifications();

  // Generate smart notifications based on study session data
  const studyNotifications = useMemo((): StudySessionNotification[] => {
    const notifications: StudySessionNotification[] = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Session reminder notifications
    if (sessionData.hasActivePlans && sessionData.todayProgress.completionPercentage < 50) {
      if (currentHour >= 8 && currentHour <= 10) {
        notifications.push({
          id: 'morning-motivation',
          type: 'session_reminder',
          title: 'Good Morning! Ready to Learn?',
          message: 'Start your day with a focused study session. You have active study plans waiting.',
          urgency: 'medium',
          actionText: 'Start Studying',
          timing: 'immediate',
          studyPlanId: sessionData.currentActivePlan?.id
        });
      } else if (currentHour >= 12 && currentHour <= 13) {
        notifications.push({
          id: 'lunch-learning',
          type: 'gentle_nudge',
          title: 'Lunch Break Learning',
          message: 'Perfect time for a quick 15-minute study session while you take a break.',
          urgency: 'low',
          actionText: 'Quick Session',
          timing: 'immediate'
        });
      } else if (currentHour >= 18 && currentHour <= 20) {
        notifications.push({
          id: 'evening-productivity',
          type: 'session_reminder',
          title: 'Evening Study Time',
          message: 'You\'re behind on today\'s study goal. A quick session can get you back on track!',
          urgency: 'high',
          actionText: 'Catch Up Now',
          timing: 'immediate'
        });
      }
    }

    // Streak warning notifications
    if (sessionData.streakDays > 0 && sessionData.todayProgress.completionPercentage === 0 && currentHour > 16) {
      notifications.push({
        id: 'streak-warning',
        type: 'streak_warning',
        title: `Don't Break Your ${sessionData.streakDays}-Day Streak!`,
        message: 'You haven\'t studied today yet. Keep your learning momentum going with a quick session.',
        urgency: 'high',
        actionText: 'Maintain Streak',
        timing: 'immediate'
      });
    }

    // Milestone celebration notifications
    if (sessionData.todayProgress.completionPercentage >= 100) {
      notifications.push({
        id: 'milestone-celebration',
        type: 'milestone_celebration',
        title: 'Daily Goal Achieved! 🎉',
        message: `Congratulations! You've completed ${sessionData.todayProgress.timeStudiedMinutes} minutes of focused learning today.`,
        urgency: 'low',
        actionText: 'Keep Going',
        timing: 'immediate'
      });
    }

    // Continue session notifications (when user has active session)
    if (sessionData.urgentAction === 'continue_session') {
      notifications.push({
        id: 'continue-session',
        type: 'session_reminder',
        title: 'Study Session Active',
        message: `Continue your ${sessionData.currentActivePlan?.title} session. You're in the zone!`,
        urgency: 'high',
        actionText: 'Continue Now',
        timing: 'immediate',
        studyPlanId: sessionData.currentActivePlan?.id
      });
    }

    return notifications;
  }, [sessionData]);

  // Create reminders for scheduled notifications
  const createStudyReminder = async (notification: StudySessionNotification, scheduleTime: Date) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          title: notification.title,
          description: notification.message,
          reminder_time: scheduleTime.toISOString(),
          type: 'study_event',
          status: 'pending',
          delivery_methods: ['in_app'],
          recurrence: 'none',
          priority: notification.urgency
        });

      if (error) {
        console.error('Error creating study reminder:', error);
      } else {
        console.log('Study reminder created:', notification.title);
      }
    } catch (error) {
      console.error('Failed to create study reminder:', error);
    }
  };

  // Auto-schedule reminders based on optimal timing
  useEffect(() => {
    if (!user || !sessionData.hasActivePlans) return;

    const now = new Date();
    
    // Schedule morning motivation (8 AM next day if after 8 AM today)
    if (now.getHours() > 8) {
      const tomorrow8AM = new Date(now);
      tomorrow8AM.setDate(tomorrow8AM.getDate() + 1);
      tomorrow8AM.setHours(8, 0, 0, 0);
      
      const morningNotification: StudySessionNotification = {
        id: 'scheduled-morning',
        type: 'session_reminder',
        title: 'Daily Study Reminder',
        message: 'Time to start today\'s learning journey! Your study plans are ready.',
        urgency: 'medium',
        actionText: 'Start Today',
        timing: 'scheduled'
      };
      
      createStudyReminder(morningNotification, tomorrow8AM);
    }

    // Schedule evening reminder (6 PM today if before 6 PM)
    if (now.getHours() < 18 && sessionData.todayProgress.completionPercentage < 50) {
      const today6PM = new Date(now);
      today6PM.setHours(18, 0, 0, 0);
      
      const eveningNotification: StudySessionNotification = {
        id: 'scheduled-evening',
        type: 'session_reminder',
        title: 'Evening Study Check-in',
        message: 'How\'s your study progress today? Let\'s finish strong!',
        urgency: 'medium',
        actionText: 'Study Now',
        timing: 'scheduled'
      };
      
      createStudyReminder(eveningNotification, today6PM);
    }
  }, [user, sessionData.hasActivePlans, sessionData.todayProgress.completionPercentage]);

  const dismissStudyNotification = (notificationId: string) => {
    // Find corresponding reminder and dismiss it
    const reminder = reminders.find(r => 
      r.type === 'study_event' && 
      r.title.toLowerCase().includes(notificationId.split('-')[0])
    );
    
    if (reminder) {
      dismissReminder(reminder.id);
    }
  };

  return {
    studyNotifications,
    dismissStudyNotification,
    createStudyReminder
  };
};
