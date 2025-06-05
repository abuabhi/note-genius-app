
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useReminderNotifications } from './useReminderNotifications';
import { Bell, Clock, CalendarClock, BrainCircuit } from 'lucide-react';

export const useReminderToasts = () => {
  const { pendingReminders } = useReminderNotifications();

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'study_event':
        return Clock;
      case 'goal_deadline':
        return CalendarClock;
      case 'flashcard_review':
        return BrainCircuit;
      case 'todo':
        return Bell;
      default:
        return Bell;
    }
  };

  useEffect(() => {
    console.log('🔔 useReminderToasts - All pending reminders:', pendingReminders);
    
    // Check for newly sent reminders (status = 'sent')
    const newReminders = pendingReminders.filter(reminder => 
      reminder.status === 'sent' && 
      new Date(reminder.reminder_time) <= new Date()
    );

    console.log('🔔 useReminderToasts - Reminders to show as toast:', newReminders);

    newReminders.forEach(reminder => {
      const Icon = getReminderIcon(reminder.type);
      
      console.log('🔔 Showing toast for reminder:', reminder.title);
      
      toast(reminder.title, {
        description: reminder.description || 'You have a new reminder',
        icon: <Icon className="h-4 w-4" />,
        duration: 8000, // Show for 8 seconds
        action: {
          label: 'Dismiss',
          onClick: () => {
            // Mark as dismissed - this could be enhanced to call a dismiss API
            console.log('Reminder dismissed:', reminder.id);
          }
        }
      });
    });

    // Also check for due reminders that are still pending (should be processed)
    const dueButPendingReminders = pendingReminders.filter(reminder => 
      reminder.status === 'pending' && 
      new Date(reminder.reminder_time) <= new Date()
    );

    if (dueButPendingReminders.length > 0) {
      console.log('⚠️ Found due reminders that are still pending (need processing):', dueButPendingReminders);
    }

  }, [pendingReminders]);

  return { pendingReminders };
};
