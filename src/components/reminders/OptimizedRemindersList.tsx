
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

// Using the SimpleReminder interface from useUnifiedReminderSystem
interface SimpleReminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string;
  due_date?: string | null;
  type: string;
  status: string;
  recurrence: string;
  delivery_methods: string[];
  priority: string;
  created_at: string;
  updated_at: string;
  events?: { id: string; title: string } | null;
  goals?: { id: string; title: string } | null;
}

interface OptimizedRemindersListProps {
  reminders: SimpleReminder[];
  loading: boolean;
  onDismiss: (id: string) => Promise<void>;
}

export const OptimizedRemindersList = ({ 
  reminders, 
  loading, 
  onDismiss 
}: OptimizedRemindersListProps) => {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-mint-600" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">All caught up!</h3>
        <p className="text-sm text-gray-500">No reminders to show right now.</p>
      </div>
    );
  }

  // Sort by status (sent first) then by time
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.status === 'sent' && b.status !== 'sent') return -1;
    if (a.status !== 'sent' && b.status === 'sent') return 1;
    return new Date(a.reminder_time).getTime() - new Date(b.reminder_time).getTime();
  });

  return (
    <div className="divide-y divide-gray-100">
      {sortedReminders.map((reminder) => (
        <div key={reminder.id} className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {reminder.title}
                </p>
                <Badge 
                  variant={reminder.status === 'sent' ? 'destructive' : 'default'}
                  className="text-xs"
                >
                  {reminder.status}
                </Badge>
              </div>
              
              {reminder.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                  {reminder.description}
                </p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>
                  {reminder.reminder_time ? 
                    formatDistanceToNow(new Date(reminder.reminder_time), { addSuffix: true }) : 
                    'No time'
                  }
                </span>
                <span className="capitalize">{reminder.type.replace('_', ' ')}</span>
                <span className="capitalize">{reminder.priority}</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(reminder.id)}
              className="flex-shrink-0 ml-2 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
