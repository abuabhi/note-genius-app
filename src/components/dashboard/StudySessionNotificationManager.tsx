
import { useEffect } from 'react';
import { useStudySessionNotifications } from '@/hooks/useStudySessionNotifications';
import { toast } from 'sonner';
import { Bell, BookOpen, Target, Trophy } from 'lucide-react';

export const StudySessionNotificationManager = () => {
  const { studyNotifications, dismissStudyNotification } = useStudySessionNotifications();

  useEffect(() => {
    // Show immediate notifications as toasts
    studyNotifications
      .filter(notification => 
        notification.timing === 'immediate' && 
        notification.urgency !== 'low'
      )
      .forEach(notification => {
        const icon = getNotificationIcon(notification.type);
        
        toast(notification.title, {
          description: notification.message,
          action: {
            label: notification.actionText,
            onClick: () => handleNotificationAction(notification)
          },
          onDismiss: () => dismissStudyNotification(notification.id),
          duration: notification.urgency === 'high' ? 10000 : 5000,
        });
      });
  }, [studyNotifications, dismissStudyNotification]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_reminder':
        return <BookOpen className="h-4 w-4" />;
      case 'streak_warning':
        return <Target className="h-4 w-4 text-orange-500" />;
      case 'milestone_celebration':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'gentle_nudge':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationAction = (notification: any) => {
    // Navigate to study session or dashboard
    if (notification.studyPlanId) {
      // Navigate to specific study plan session
      window.location.href = `/dashboard?startStudy=${notification.studyPlanId}`;
    } else {
      // Navigate to dashboard
      window.location.href = '/dashboard';
    }
    
    dismissStudyNotification(notification.id);
  };

  // This component doesn't render anything visible - it just manages notifications
  return null;
};
