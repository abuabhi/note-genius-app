
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Bell, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OptimizedRemindersList } from './OptimizedRemindersList';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';

export const OptimizedReminderPopover = () => {
  const { 
    reminders, 
    unreadCount, 
    isLoading, 
    dismissReminder, 
    dismissAll,
    isDismissing 
  } = useUnifiedReminderSystem({
    enableRealtime: true,
    enableNotifications: true,
  });
  const [open, setOpen] = useState(false);
  
  // Get any overdue reminders for urgent styling
  const now = new Date();
  const hasOverdueReminders = reminders.some(
    r => r.status === 'pending' && r.reminder_time && new Date(r.reminder_time) < now
  );
  
  console.log('🔔 OptimizedReminderPopover - UNIFIED SYSTEM ONLY - Unread:', unreadCount);
  
  const handleDismissAll = () => {
    dismissAll();
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs transition-colors ${
                hasOverdueReminders 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-primary'
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Reminders (Unified System)</h4>
            {unreadCount > 0 && (
              <Badge 
                variant="outline" 
                className={hasOverdueReminders ? 'text-red-600 border-red-300' : ''}
              >
                {unreadCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissAll}
                disabled={isDismissing}
                className="text-xs px-2 py-1 h-auto"
              >
                {isDismissing ? 'Dismissing...' : 'Dismiss All'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-hidden">
          <div className="p-4">
            <OptimizedRemindersList 
              reminders={reminders}
              loading={isLoading}
              onDismiss={async (id) => {
                console.log('🗑️ Dismissing via UNIFIED SYSTEM:', id);
                dismissReminder(id);
              }}
            />
          </div>
        </div>

        {/* Footer with performance info */}
        {reminders.length > 0 && (
          <div className="border-t px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>UNIFIED SYSTEM - Real-time updates</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Single Source</span>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
