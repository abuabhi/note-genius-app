
import { useState, useEffect } from 'react';
import { NotificationTimingEngine } from '@/utils/notificationTimingEngine';
import { useActiveStudySessionData } from './useActiveStudySessionData';

export const useSmartStudyTiming = () => {
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>('default');
  const sessionData = useActiveStudySessionData();

  useEffect(() => {
    // Check and request notification permission
    NotificationTimingEngine.getBrowserNotificationPermission()
      .then(permission => {
        setBrowserNotificationPermission(permission);
        console.log('Browser notification permission:', permission);
      });
  }, []);

  const shouldShowNotification = () => {
    const now = new Date();
    const context = {
      currentHour: now.getHours(),
      dayOfWeek: now.getDay(),
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      studyProgress: sessionData.todayProgress.completionPercentage,
      lastStudyTime: undefined, // Could be enhanced with actual last study time
      preferredStudyHours: [8, 9, 12, 18, 19] // Could be user-customizable
    };

    return NotificationTimingEngine.shouldShowBrowserNotification(context);
  };

  const getOptimalTiming = () => {
    const now = new Date();
    const context = {
      currentHour: now.getHours(),
      dayOfWeek: now.getDay(),
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      studyProgress: sessionData.todayProgress.completionPercentage,
    };

    return NotificationTimingEngine.calculateOptimalTiming(context);
  };

  const showBrowserNotification = (title: string, body: string, actionUrl?: string) => {
    if (browserNotificationPermission === 'granted' && shouldShowNotification()) {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'study-reminder',
        requireInteraction: true
      });

      notification.onclick = () => {
        if (actionUrl) {
          window.focus();
          window.location.href = actionUrl;
        } else {
          window.focus();
        }
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  };

  return {
    browserNotificationPermission,
    shouldShowNotification,
    getOptimalTiming,
    showBrowserNotification,
    canShowBrowserNotifications: browserNotificationPermission === 'granted'
  };
};
