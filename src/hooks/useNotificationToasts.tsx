
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNotifications } from './useNotifications';
import { Bell, Clock, Target, Calendar } from 'lucide-react';

export const useNotificationToasts = () => {
  const { notifications, dismissNotification } = useNotifications();
  const shownNotifications = useRef(new Set<string>());

  const getIcon = (type: string) => {
    switch (type) {
      case 'study_event':
      case 'study_session':
        return Clock;
      case 'goal_deadline':
        return Target;
      case 'todo':
        return Calendar;
      default:
        return Bell;
    }
  };

  useEffect(() => {
    console.log('🔔 Checking for new notifications to show as toasts:', notifications.length);
    
    // Show toasts for notifications that are due and haven't been shown yet
    const newNotifications = notifications.filter(notification => {
      const notificationTime = new Date(notification.reminder_time);
      const now = new Date();
      const shouldShow = notificationTime <= now && 
                        notification.status === 'pending' && 
                        !shownNotifications.current.has(notification.id);
      
      return shouldShow;
    });

    console.log('🔔 New notifications to show as toast:', newNotifications.length);

    newNotifications.forEach(notification => {
      const Icon = getIcon(notification.type);
      
      console.log('🔔 Showing toast for notification:', notification.title);
      
      // Mark as shown
      shownNotifications.current.add(notification.id);
      
      const isOverdue = notification.due_date && notification.due_date <= new Date().toISOString().split('T')[0];
      
      toast(notification.title, {
        description: notification.description || 'You have a new reminder',
        icon: <Icon className="h-4 w-4" />,
        duration: isOverdue ? 10000 : 8000,
        className: isOverdue ? 'border-red-200 bg-red-50' : '',
        action: {
          label: 'Dismiss',
          onClick: async () => {
            console.log('Notification dismissed via toast:', notification.id);
            dismissNotification(notification.id);
          }
        }
      });
    });

    // Clean up shown notifications that are no longer active
    const currentNotificationIds = new Set(notifications.map(n => n.id));
    const toRemove = Array.from(shownNotifications.current).filter(id => !currentNotificationIds.has(id));
    toRemove.forEach(id => shownNotifications.current.delete(id));

  }, [notifications, dismissNotification]);

  return { activeNotifications: notifications };
};
