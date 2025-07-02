
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Bell, X, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export const NotificationPopover = () => {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    totalCount, 
    unreadCount,
    isLoading, 
    dismissNotification,
    dismissAll,
    isDismissing
  } = useNotifications();

  const handleDismissAll = () => {
    dismissAll();
  };

  const handleDismissSingle = (id: string) => {
    dismissNotification(id);
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
        <Bell className="h-5 w-5 animate-pulse" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full hover:bg-gray-50 transition-colors"
          aria-label={`${totalCount} notifications`}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {totalCount > 0 && (
            <Badge 
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-medium bg-blue-500 text-white shadow-md"
            >
              {totalCount > 99 ? '99+' : totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 shadow-xl border bg-white" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Notifications</h4>
              {totalCount > 0 && (
                <p className="text-xs text-gray-600">
                  {unreadCount} new, {totalCount} total
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {totalCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissAll}
                disabled={isDismissing}
                className="text-xs px-2 py-1 h-auto hover:bg-gray-100 text-gray-700"
              >
                {isDismissing ? (
                  <>
                    <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin mr-1" />
                    Dismissing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Dismiss All
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-6 w-6 hover:bg-gray-100 text-gray-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[500px] overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">All caught up!</h3>
              <p className="text-sm text-gray-600">No notifications to show right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        {notification.status === 'pending' && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            New
                          </Badge>
                        )}
                        <Badge 
                          variant="outline"
                          className="text-xs bg-gray-100 text-gray-800 border-gray-200"
                        >
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {notification.description && (
                        <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                          {notification.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notification.reminder_time ? 
                            formatDistanceToNow(new Date(notification.reminder_time), { addSuffix: true }) : 
                            'No time'
                          }
                        </span>
                        {notification.priority !== 'medium' && (
                          <span className={`capitalize ${
                            notification.priority === 'high' ? 'text-orange-600' :
                            notification.priority === 'urgent' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {notification.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissSingle(notification.id)}
                      disabled={isDismissing}
                      className="flex-shrink-0 ml-2 h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalCount > 0 && (
          <div className="border-t px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-center text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Real-time updates • {totalCount} active</span>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
