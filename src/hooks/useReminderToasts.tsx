
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useReminderNotifications } from './useReminderNotifications';
import { Bell, Clock, CalendarClock, BrainCircuit } from 'lucide-react';

export const useReminderToasts = () => {
  const { pendingReminders, dismissReminder } = useReminderNotifications();
  const shownReminders = useRef(new Set<string>());

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
    
    // Check for newly sent reminders (status = 'sent') that haven't been shown yet
    const newReminders = pendingReminders.filter(reminder => 
      reminder.status === 'sent' && 
      new Date(reminder.reminder_time) <= new Date() &&
      !shownReminders.current.has(reminder.id)
    );

    console.log('🔔 useReminderToasts - New reminders to show as toast:', newReminders);

    newReminders.forEach(reminder => {
      const Icon = getReminderIcon(reminder.type);
      
      console.log('🔔 Showing toast for reminder:', reminder.title);
      
      // Mark this reminder as shown
      shownReminders.current.add(reminder.id);
      
      toast(reminder.title, {
        description: reminder.description || 'You have a new reminder',
        icon: <Icon className="h-4 w-4" />,
        duration: 8000, // Show for 8 seconds
        action: {
          label: 'Dismiss',
          onClick: async () => {
            console.log('Reminder dismissed via toast:', reminder.id);
            await dismissReminder(reminder.id);
          }
        }
      });
    });

    // Clean up shown reminders that are no longer in pending list
    const currentReminderIds = new Set(pendingReminders.map(r => r.id));
    const toRemove = Array.from(shownReminders.current).filter(id => !currentReminderIds.has(id));
    toRemove.forEach(id => shownReminders.current.delete(id));

  }, [pendingReminders, dismissReminder]);

  return { pendingReminders };
};
