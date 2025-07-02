
import { useEffect } from 'react';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { toast } from 'sonner';
import { Bell, BookOpen, Target, Trophy } from 'lucide-react';

export const StudySessionNotificationManager = () => {
  const { reminders, dismissReminder } = useUnifiedReminderSystem({
    enableRealtime: true,
    limit: 50
  });

  // Filter for study-related notifications
  const studyNotifications = reminders.filter(reminder => 
    reminder.type === 'study_session' || 
    reminder.type === 'flashcard_review' ||
    reminder.status === 'sent'
  );

  useEffect(() => {
    // Show immediate notifications as toasts for high priority study reminders
    studyNotifications
      .filter(notification => 
        notification.status === 'sent' && 
        notification.priority === 'high'
      )
      .forEach(notification => {
        const icon = getNotificationIcon(notification.type);
        
        toast(notification.title, {
          description: notification.description || 'Time for your study session!',
          action: {
            label: 'Start Studying',
            onClick: () => handleNotificationAction(notification)
          },
          onDismiss: () => dismissReminder(notification.id),
          duration: 10000,
        });
      });
  }, [studyNotifications, dismissReminder]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'study_session':
        return <BookOpen className="h-4 w-4" />;
      case 'flashcard_review':
        return <Target className="h-4 w-4 text-orange-500" />;
      case 'goal_deadline':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleNotificationAction = (notification: any) => {
    // Navigate to study session or dashboard
    if (notification.events?.id) {
      // Navigate to specific study session
      window.location.href = `/dashboard?startStudy=${notification.events.id}`;
    } else {
      // Navigate to dashboard
      window.location.href = '/dashboard';
    }
    
    dismissReminder(notification.id);
  };

  // This component doesn't render anything visible - it just manages notifications
  return null;
};
