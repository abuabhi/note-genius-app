
import { useState } from 'react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { Bell, X, CheckCircle, Clock, CalendarClock, BrainCircuit, RefreshCw, Sparkles } from 'lucide-react';
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
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'goal_deadline':
        return <CalendarClock className="h-4 w-4 text-green-500" />;
      case 'flashcard_review':
        return <BrainCircuit className="h-4 w-4 text-purple-500" />;
      case 'todo':
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getReminderGradient = (type: string, status: string) => {
    const isOverdue = status === 'pending' && new Date() > new Date();
    const isSent = status === 'sent';
    
    if (isOverdue) {
      return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-150';
    }
    
    if (isSent) {
      return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150';
    }
    
    switch (type) {
      case 'study_event':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150';
      case 'goal_deadline':
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-150';
      case 'flashcard_review':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-150';
      case 'todo':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-150';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-150';
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

  const now = new Date();
  const duePendingReminders = pendingReminders.filter(r => 
    r.status === 'pending' && new Date(r.reminder_time) <= now
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative hover:bg-mint-50 transition-colors">
            <Bell className="h-5 w-5 text-mint-600" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center">
                <Badge
                  variant="destructive"
                  className="px-1.5 min-w-[1.2rem] h-5 flex items-center justify-center rounded-full text-[0.7rem] bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-lg animate-pulse"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-ping opacity-20"></div>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 bg-white shadow-2xl border-0 rounded-2xl overflow-hidden" align="end">
          {/* Header */}
          <div className="bg-gradient-to-r from-mint-500 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Reminders</h3>
                  <p className="text-mint-100 text-sm">Stay on track with your goals</p>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-mint-200 animate-pulse" />
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              {duePendingReminders.length > 0 && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleProcessReminders}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Process ({duePendingReminders.length})
                </Button>
              )}
              {unreadCount > 0 && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleDismissAll}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="h-96">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-2 border-mint-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm">Loading reminders...</p>
                </div>
              </div>
            ) : pendingReminders.length > 0 ? (
              <div className="p-4 space-y-3">
                {pendingReminders.map((reminder) => {
                  const isOverdue = reminder.status === 'pending' && new Date(reminder.reminder_time) <= now;
                  const isSent = reminder.status === 'sent';
                  
                  return (
                    <div 
                      key={reminder.id} 
                      className={`
                        group relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-[1.02]
                        ${getReminderGradient(reminder.type, reminder.status)}
                      `}
                    >
                      {/* Status indicators */}
                      {isOverdue && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      {isSent && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getReminderIcon(reminder.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 leading-5 line-clamp-2">
                                {reminder.title}
                              </h4>
                              {reminder.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {reminder.description}
                                </p>
                              )}
                            </div>
                            
                            {/* Status badges */}
                            <div className="flex flex-col items-end gap-1">
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs px-2 py-0.5 bg-red-500">
                                  Overdue
                                </Badge>
                              )}
                              {isSent && (
                                <Badge className="text-xs px-2 py-0.5 bg-blue-500">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Time info */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xs text-gray-500 space-y-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{getFormattedDate(reminder.reminder_time)}</span>
                              </div>
                              <div className="text-gray-400">
                                {getRelativeTimeString(reminder.reminder_time)}
                              </div>
                            </div>
                            
                            {/* Action button */}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/60"
                              onClick={() => handleDismiss(reminder.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-20 h-20 bg-gradient-to-r from-mint-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-mint-600" />
                </div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">All caught up!</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  You're doing great! No pending reminders at the moment.
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  ✨ Stay organized and focused
                </div>
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
