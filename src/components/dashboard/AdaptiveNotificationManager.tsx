
import { useEffect } from 'react';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useStudySessionNotifications } from '@/hooks/useStudySessionNotifications';
import { useSmartStudyTiming } from '@/hooks/useSmartStudyTiming';
import { toast } from 'sonner';

export const AdaptiveNotificationManager = () => {
  const { getEffectiveSettings } = useNotificationSettings();
  const { studyNotifications } = useStudySessionNotifications();
  const { showBrowserNotification, canShowBrowserNotifications } = useSmartStudyTiming();

  useEffect(() => {
    const effectiveSettings = getEffectiveSettings();
    
    // Filter notifications based on user preferences
    const filteredNotifications = studyNotifications.filter(notification => {
      // Check if user wants this type of notification
      switch (notification.type) {
        case 'session_reminder':
          return effectiveSettings.studyReminders;
        case 'streak_warning':
          return effectiveSettings.streakWarnings;
        case 'milestone_celebration':
          return effectiveSettings.achievements;
        case 'gentle_nudge':
          return effectiveSettings.frequency >= 2; // Only show nudges if frequency is moderate or higher
        default:
          return true;
      }
    });

    // Apply frequency limits
    const maxNotifications = effectiveSettings.frequency === 1 ? 1 : 
                            effectiveSettings.frequency === 2 ? 2 : 3;
    
    const prioritizedNotifications = filteredNotifications
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.urgency] - priorityOrder[a.urgency];
      })
      .slice(0, maxNotifications);

    // Show notifications
    prioritizedNotifications.forEach(notification => {
      // Browser notification for high priority items
      if (notification.urgency === 'high' && 
          effectiveSettings.browserNotifications && 
          canShowBrowserNotifications) {
        showBrowserNotification(
          notification.title, 
          notification.message,
          notification.studyPlanId ? `/dashboard?startStudy=${notification.studyPlanId}` : '/dashboard'
        );
      }

      // Always show in-app toast (filtered by settings above)
      toast(notification.title, {
        description: notification.message,
        action: {
          label: notification.actionText,
          onClick: () => {
            if (notification.studyPlanId) {
              window.location.href = `/dashboard?startStudy=${notification.studyPlanId}`;
            } else {
              window.location.href = '/dashboard';
            }
          }
        },
        duration: notification.urgency === 'high' ? 8000 : 5000,
      });
    });
  }, [studyNotifications, getEffectiveSettings, showBrowserNotification, canShowBrowserNotifications]);

  // This component doesn't render anything - it just manages adaptive notifications
  return null;
};
