
// @ts-nocheck

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useUnifiedReminderSystem } from './useUnifiedReminderSystem';
import { Bell, Clock, CalendarClock, BrainCircuit, Calendar } from 'lucide-react';

export const useReminderToasts = () => {
  const { reminders, dismissReminder } = useUnifiedReminderSystem({
    enableRealtime: true,
    enableNotifications: true,
    limit: 1000
  });
  const shownReminders = useRef(new Set<string>());

  const getReminderIcon = (type: string, isDueDate: boolean = false) => {
    if (isDueDate) return Calendar;
    
    switch (type) {
      case 'study_event':
      case 'study_session':
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

  const getReminderMessage = (reminder: any) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if this is a due date notification
    const isDueDate = reminder.type === 'todo' && reminder.due_date && reminder.due_date <= today;
    
    if (isDueDate) {
      const isOverdue = reminder.due_date < today;
      return {
        title: isOverdue ? `Overdue: ${reminder.title}` : `Due Today: ${reminder.title}`,
        description: isOverdue ? 
          `Your todo "${reminder.title}" was due on ${reminder.due_date}` :
          `Your todo "${reminder.title}" is due today!`,
        isDueDate: true
      };
    }
    
    // Regular reminder time notification
    return {
      title: reminder.title,
      description: reminder.description || 'You have a new reminder',
      isDueDate: false
    };
  };

  useEffect(() => {
    console.log('🔔 useReminderToasts - Simplified System:', reminders.length);
    
    // Show toasts for new active reminders that need attention
    const newReminders = reminders.filter(reminder => {
      const now = new Date();
      const reminderTime = new Date(reminder.reminder_time);
      const todayStr = now.toISOString().split('T')[0];

      // Include todos due today/overdue even if reminder_time is later
      const isDueDate = reminder.type === 'todo' && reminder.due_date && reminder.due_date <= todayStr;

      const shouldShow =
        (reminderTime <= now || isDueDate) &&
        reminder.status === 'pending' &&
        !shownReminders.current.has(reminder.id);

      return shouldShow;
    });

    console.log('🔔 New reminders to show as toast:', newReminders.length);

    newReminders.forEach(reminder => {
      const messageInfo = getReminderMessage(reminder);
      const Icon = getReminderIcon(reminder.type, messageInfo.isDueDate);
      
      console.log('🔔 Showing toast for reminder:', messageInfo.title);
      
      // Mark this reminder as shown
      shownReminders.current.add(reminder.id);
      
      toast(messageInfo.title, {
        description: messageInfo.description,
        icon: <Icon className="h-4 w-4" />,
        duration: messageInfo.isDueDate ? 10000 : 8000,
        action: {
          label: 'Dismiss',
          onClick: async () => {
            console.log('Reminder dismissed via toast:', reminder.id);
            dismissReminder(reminder.id);
          }
        }
      });
    });

    // Clean up shown reminders that are no longer active
    const currentReminderIds = new Set(reminders.map(r => r.id));
    const toRemove = Array.from(shownReminders.current).filter(id => !currentReminderIds.has(id));
    toRemove.forEach(id => shownReminders.current.delete(id));

  }, [reminders, dismissReminder]);

  return { activeReminders: reminders };
};
