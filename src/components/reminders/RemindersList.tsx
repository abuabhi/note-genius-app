import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { 
  Bell, 
  Calendar, 
  Clock, 
  Target, 
  X, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Reminder } from "@/hooks/useReminders";

interface RemindersListProps {
  reminders: Reminder[];
  loading: boolean;
  onDismiss: (id: string) => Promise<boolean>;
}

export const RemindersList = ({ reminders, loading, onDismiss }: RemindersListProps) => {
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set());
  
  const handleDismiss = async (id: string) => {
    setDismissingIds(prev => new Set(prev).add(id));
    await onDismiss(id);
    setDismissingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };
  
  const getIconForType = (type: Reminder['type']) => {
    switch (type) {
      case 'study_event':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'goal_deadline':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'flashcard_review':
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getTypeLabel = (type: Reminder['type']) => {
    switch (type) {
      case 'study_event':
        return 'Event';
      case 'goal_deadline':
        return 'Goal';
      case 'flashcard_review':
        return 'Flashcards';
      default:
        return 'Reminder';
    }
  };
  
  const getReminderTimeDisplay = (reminderTime: string) => {
    const reminderDate = new Date(reminderTime);
    const now = new Date();
    
    // Check if it's today
    if (
      reminderDate.getDate() === now.getDate() &&
      reminderDate.getMonth() === now.getMonth() &&
      reminderDate.getFullYear() === now.getFullYear()
    ) {
      return `Today at ${format(reminderDate, 'h:mm a')}`;
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (
      reminderDate.getDate() === tomorrow.getDate() &&
      reminderDate.getMonth() === tomorrow.getMonth() &&
      reminderDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return `Tomorrow at ${format(reminderDate, 'h:mm a')}`;
    }
    
    // Otherwise, show full date
    return format(reminderDate, 'MMM d, yyyy h:mm a');
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center border rounded-lg bg-muted/10">
        <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
        <h3 className="font-medium text-lg mb-1">All caught up!</h3>
        <p className="text-muted-foreground text-sm">
          You don't have any pending reminders.
        </p>
      </div>
    );
  }
  
  // Sort reminders by time (most recent first)
  const sortedReminders = [...reminders].sort((a, b) => {
    return new Date(a.reminder_time).getTime() - new Date(b.reminder_time).getTime();
  });
  
  // Check for overdue reminders
  const now = new Date();
  const overdueReminders = sortedReminders.filter(
    reminder => new Date(reminder.reminder_time) < now && reminder.status === 'pending'
  );
  
  return (
    <div className="space-y-4">
      {overdueReminders.length > 0 && (
        <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded p-2 text-amber-700">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>You have {overdueReminders.length} overdue {overdueReminders.length === 1 ? 'reminder' : 'reminders'}</span>
        </div>
      )}
      
      {sortedReminders.map((reminder) => {
        const isPast = new Date(reminder.reminder_time) < now;
        
        return (
          <Card 
            key={reminder.id}
            className={`overflow-hidden ${
              isPast ? 'border-amber-300 bg-amber-50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="mt-1">
                    {getIconForType(reminder.type)}
                  </div>
                  <div>
                    <div className="font-medium">{reminder.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{getReminderTimeDisplay(reminder.reminder_time)}</span>
                      {isPast && <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 ml-1">Overdue</Badge>}
                    </div>
                    {reminder.description && (
                      <div className="mt-1 text-sm">{reminder.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(reminder.type)}
                  </Badge>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDismiss(reminder.id)}
                    disabled={dismissingIds.has(reminder.id)}
                  >
                    {dismissingIds.has(reminder.id) ? (
                      <div className="h-4 w-4 border-2 border-t-transparent border-muted-foreground rounded-full animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
