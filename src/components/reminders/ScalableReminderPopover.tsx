
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { ScalableRemindersList } from './ScalableRemindersList';
import { toast } from 'sonner';

export const ScalableReminderPopover = () => {
  const [open, setOpen] = useState(false);
  const { 
    reminders, 
    isLoading, 
    dismissReminder,
    dismissAll,
    isDismissing,
    totalCount,
    unreadCount,
    refresh
  } = useUnifiedReminderSystem({
    limit: 20,
    enableRealtime: true,
  });
  
  // Count pending reminders
  const pendingCount = reminders.filter(r => r.status === 'pending').length;
  const sentCount = reminders.filter(r => r.status === 'sent').length;
  
  // Get overdue reminders for styling
  const now = new Date();
  const hasOverdueReminders = reminders.some(
    r => r.status === 'pending' && r.reminder_time && new Date(r.reminder_time) < now
  );

  // Handle dismiss all - FIXED VERSION
  const handleDismissAll = useCallback(async () => {
    console.log('🗑️ HandleDismissAll called - Current reminders:', reminders.length);
    console.log('📊 Reminder statuses:', reminders.map(r => ({ id: r.id, status: r.status, title: r.title })));
    
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    console.log('🎯 Sent reminder IDs to dismiss:', sentReminderIds);
    
    if (sentReminderIds.length === 0) {
      toast.info('No sent reminders to dismiss');
      return;
    }
    
    // Call the dismissAll function directly - no manual handling
    dismissAll();
  }, [reminders, dismissAll]);

  // Handle single dismiss - FIXED VERSION
  const handleDismissSingle = useCallback(async (id: string) => {
    console.log('🗑️ Dismissing single reminder:', id);
    dismissReminder(id);
  }, [dismissReminder]);

  const isReminderDismissing = (id: string) => isDismissing;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full hover:bg-gray-50 transition-colors"
          aria-label={`${totalCount} reminders`}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {totalCount > 0 && (
            <Badge 
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-medium bg-red-500 text-white shadow-md"
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
            <div className="p-2 bg-gray-100 rounded-full">
              <Bell className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Reminders</h4>
              {totalCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {pendingCount > 0 && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {pendingCount} pending
                    </Badge>
                  )}
                  {sentCount > 0 && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {sentCount} sent
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {sentCount > 0 && (
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
                    Dismiss All ({sentCount})
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
          <ScalableRemindersList 
            reminders={reminders}
            loading={isLoading}
            hasMore={false}
            onDismiss={handleDismissSingle}
            onLoadMore={() => {}}
            isReminderDismissing={isReminderDismissing}
          />
        </div>

        {/* Footer */}
        {totalCount > 0 && (
          <div className="border-t px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-center text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>UNIFIED System - {totalCount} reminders</span>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
