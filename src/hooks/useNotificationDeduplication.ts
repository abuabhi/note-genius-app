
import { useState, useRef, useCallback } from 'react';

interface NotificationTracker {
  id: string;
  lastShown: number;
  count: number;
}

interface UseNotificationDeduplicationOptions {
  cooldownMinutes?: number;
  maxPerHour?: number;
}

export const useNotificationDeduplication = (options: UseNotificationDeduplicationOptions = {}) => {
  const { cooldownMinutes = 30, maxPerHour = 3 } = options;
  const [shownNotifications, setShownNotifications] = useState<Map<string, NotificationTracker>>(new Map());
  const sessionStartTime = useRef(Date.now());

  const shouldShowNotification = useCallback((notificationId: string): boolean => {
    const now = Date.now();
    const tracker = shownNotifications.get(notificationId);
    
    // If never shown, allow it
    if (!tracker) {
      return true;
    }
    
    // Check cooldown period
    const timeSinceLastShown = now - tracker.lastShown;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    
    if (timeSinceLastShown < cooldownMs) {
      return false;
    }
    
    // Check hourly limit
    const oneHourAgo = now - (60 * 60 * 1000);
    if (tracker.lastShown > oneHourAgo && tracker.count >= maxPerHour) {
      return false;
    }
    
    return true;
  }, [shownNotifications, cooldownMinutes, maxPerHour]);

  const markNotificationShown = useCallback((notificationId: string) => {
    const now = Date.now();
    setShownNotifications(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(notificationId);
      
      if (existing) {
        // Reset count if it's been more than an hour
        const oneHourAgo = now - (60 * 60 * 1000);
        const count = existing.lastShown > oneHourAgo ? existing.count + 1 : 1;
        
        newMap.set(notificationId, {
          id: notificationId,
          lastShown: now,
          count
        });
      } else {
        newMap.set(notificationId, {
          id: notificationId,
          lastShown: now,
          count: 1
        });
      }
      
      return newMap;
    });
  }, []);

  const clearNotificationHistory = useCallback(() => {
    setShownNotifications(new Map());
  }, []);

  return {
    shouldShowNotification,
    markNotificationShown,
    clearNotificationHistory
  };
};
