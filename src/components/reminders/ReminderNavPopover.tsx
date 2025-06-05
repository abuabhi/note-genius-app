
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
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="font-medium">Reminders</h3>
            <div className="flex gap-1">
              {duePendingReminders.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleProcessReminders}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Process ({duePendingReminders.length})
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowCreateDialog(true);
                }}
              >
                New
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDismissAll}
                >
                  Dismiss All
                </Button>
              )}
            </div>
          </div>
          <ScrollArea className="h-[300px] p-0">
            {loading ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Loading...
              </div>
            ) : pendingReminders.length > 0 ? (
              <div className="flex flex-col">
                {pendingReminders.map((reminder) => (
                  <div 
                    key={reminder.id} 
                    className={`p-3 border-b flex justify-between hover:bg-gray-50 dark:hover:bg-gray-900 ${
                      reminder.status === 'sent' ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    } ${
                      reminder.status === 'pending' && new Date(reminder.reminder_time) <= now ? 'bg-orange-50 dark:bg-orange-950/20' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        {getReminderIcon(reminder.type)}
                        <span className="font-medium">{reminder.title}</span>
                        {reminder.status === 'pending' && new Date(reminder.reminder_time) <= now && (
                          <Badge variant="outline" className="ml-2 text-xs border-orange-300 text-orange-600">
                            Due
                          </Badge>
                        )}
                      </div>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 ml-6">
                          {reminder.description}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1 ml-6">
                        {getFormattedDate(reminder.reminder_time)} • {getRelativeTimeString(reminder.reminder_time)}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 ml-2 self-center"
                      onClick={() => handleDismiss(reminder.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">You're all caught up!</p>
                <p className="text-xs text-muted-foreground">No pending reminders</p>
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
