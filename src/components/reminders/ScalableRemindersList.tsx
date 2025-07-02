
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Trash2, Clock } from 'lucide-react';
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

interface ScalableRemindersListProps {
  reminders: SimpleReminder[];
  loading: boolean;
  hasMore: boolean;
  onDismiss: (id: string) => void;
  onLoadMore: () => void;
  isReminderDismissing: (id: string) => boolean;
}

export const ScalableRemindersList = ({ 
  reminders, 
  loading, 
  hasMore,
  onDismiss,
  onLoadMore,
  isReminderDismissing
}: ScalableRemindersListProps) => {
  if (loading && reminders.length === 0) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-gray-600" />
        </div>
        <h3 className="font-medium text-gray-800 mb-2">All caught up!</h3>
        <p className="text-sm text-gray-600">No reminders to show right now.</p>
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
        <div key={reminder.id} className="p-4 hover:bg-gray-50 transition-colors relative">
          {isReminderDismissing(reminder.id) && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Dismissing...</span>
              </div>
            </div>
          )}
          
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {reminder.title}
                </p>
                <Badge 
                  variant={reminder.status === 'sent' ? 'destructive' : 'default'}
                  className="text-xs bg-gray-100 text-gray-800 border-gray-200"
                >
                  {reminder.status}
                </Badge>
              </div>
              
              {reminder.description && (
                <p className="text-xs text-gray-700 mb-2 line-clamp-1">
                  {reminder.description}
                </p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
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
              disabled={isReminderDismissing(reminder.id)}
              className="flex-shrink-0 ml-2 h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
      
      {hasMore && (
        <div className="p-4 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLoadMore}
            disabled={loading}
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};
