
import { useState } from 'react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { Bell, X, CheckCircle, Clock, CalendarClock, BrainCircuit, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Reminder } from '@/hooks/useReminders';
import { ReminderFormDialog } from '@/components/reminders/ReminderFormDialog';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import { useReminders } from '@/hooks/useReminders';
import { Badge } from '@/components/ui/badge';

export function ReminderNavPopover() {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { pendingReminders, unreadCount, loading, dismissReminder, dismissAll, processReminders } = useReminderNotifications();
  const { createReminder } = useReminders();

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const getRelativeTimeString = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'study_event':
        return <Clock className="h-4 w-4 mr-2 text-blue-500" />;
      case 'goal_deadline':
        return <CalendarClock className="h-4 w-4 mr-2 text-green-500" />;
      case 'flashcard_review':
        return <BrainCircuit className="h-4 w-4 mr-2 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  const handleDismiss = async (id: string) => {
    await dismissReminder(id);
  };

  const handleDismissAll = async () => {
    await dismissAll();
    setOpen(false);
  };

  const handleCreateReminder = async (data: any) => {
    await createReminder.mutateAsync(data);
    return true;
  };

  const handleProcessReminders = async () => {
    await processReminders();
  };

  // Count due pending reminders for debugging
  const now = new Date();
  const duePendingReminders = pendingReminders.filter(r => 
    r.status === 'pending' && new Date(r.reminder_time) <= now
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 px-1.5 min-w-[1.2rem] h-5 flex items-center justify-center rounded-full text-[0.7rem]"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg" align="end">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Reminders</h3>
            <div className="flex gap-2">
              {duePendingReminders.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleProcessReminders}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Process ({duePendingReminders.length})
                </Button>
              )}
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDismissAll}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 text-xs"
                >
                  Dismiss All
                </Button>
              )}
            </div>
          </div>
          <ScrollArea className="h-[300px] p-0">
            {loading ? (
              <div className="flex items-center justify-center h-[200px] text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : pendingReminders.length > 0 ? (
              <div className="flex flex-col">
                {pendingReminders.map((reminder) => (
                  <div 
                    key={reminder.id} 
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      reminder.status === 'sent' ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    } ${
                      reminder.status === 'pending' && new Date(reminder.reminder_time) <= now ? 'bg-orange-50 dark:bg-orange-950/20' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        {getReminderIcon(reminder.type)}
                        <span className="font-medium text-gray-900 dark:text-white">{reminder.title}</span>
                        {reminder.status === 'pending' && new Date(reminder.reminder_time) <= now && (
                          <Badge variant="outline" className="ml-2 text-xs border-orange-300 text-orange-600 bg-orange-100 dark:bg-orange-950/50 dark:border-orange-600 dark:text-orange-400">
                            Due
                          </Badge>
                        )}
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ml-6">
                          {reminder.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                        {getFormattedDate(reminder.reminder_time)} • {getRelativeTimeString(reminder.reminder_time)}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 ml-2 self-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => handleDismiss(reminder.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">You're all caught up!</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">No pending reminders</p>
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      <ReminderFormDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onReminderCreated={() => setShowCreateDialog(false)}
      />
    </>
  );
}
