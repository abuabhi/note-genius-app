
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useStudySessionNotifications } from '@/hooks/useStudySessionNotifications';
import { useSmartStudyTiming } from '@/hooks/useSmartStudyTiming';
import { useNotificationDeduplication } from '@/hooks/useNotificationDeduplication';
import { toast } from 'sonner';

export const AdaptiveNotificationManager = () => {
  const location = useLocation();
  const { getEffectiveSettings } = useNotificationSettings();
  const { studyNotifications } = useStudySessionNotifications();
  const { showBrowserNotification, canShowBrowserNotifications } = useSmartStudyTiming();
  const { shouldShowNotification, markNotificationShown } = useNotificationDeduplication({
    cooldownMinutes: 30,
    maxPerHour: 2
  });

  useEffect(() => {
    const effectiveSettings = getEffectiveSettings();
    
    // Don't show notifications on analytics page to prevent spam
    if (location.pathname === '/analytics') {
      return;
    }
    
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
          return effectiveSettings.frequency >= 2;
        default:
          return true;
      }
    });

    // Apply frequency limits and deduplication
    const maxNotifications = effectiveSettings.frequency === 1 ? 1 : 
                            effectiveSettings.frequency === 2 ? 2 : 3;
    
    const prioritizedNotifications = filteredNotifications
      .filter(notification => shouldShowNotification(notification.id))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.urgency] - priorityOrder[a.urgency];
      })
      .slice(0, maxNotifications);

    // Show notifications with deduplication
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

      // Show in-app toast with deduplication
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

      // Mark notification as shown
      markNotificationShown(notification.id);
    });
  }, [
    studyNotifications, 
    getEffectiveSettings, 
    showBrowserNotification, 
    canShowBrowserNotifications,
    shouldShowNotification,
    markNotificationShown,
    location.pathname
  ]);

  // This component doesn't render anything - it just manages adaptive notifications
  return null;
};
