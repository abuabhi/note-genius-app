import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useScalableReminders } from '@/hooks/reminders/useScalableReminders';
import { ScalableRemindersList } from './ScalableRemindersList';

export const ScalableReminderPopover = () => {
  const [open, setOpen] = useState(false);
  const { 
    reminders, 
    isLoading, 
    dismissReminder,
    batchDismissReminders,
    isDismissing,
    isBatchDismissing,
    isReminderDismissing,
    hasMore,
    loadMore
  } = useScalableReminders({
    limit: 20,
    status: ['pending', 'sent'],
    enableRealtime: true,
  });
  
  // Count pending reminders
  const pendingCount = reminders.filter(r => r.status === 'pending').length;
  const sentCount = reminders.filter(r => r.status === 'sent').length;
  const totalCount = pendingCount + sentCount;
  
  // Get overdue reminders for urgent styling
  const now = new Date();
  const hasOverdueReminders = reminders.some(
    r => r.status === 'pending' && r.reminder_time && new Date(r.reminder_time) < now
  );

  // Handle dismiss all with proper error handling
  const handleDismissAll = useCallback(() => {
    const sentReminderIds = reminders
      .filter(r => r.status === 'sent')
      .map(r => r.id);
    
    if (sentReminderIds.length > 0) {
      batchDismissReminders(sentReminderIds);
    }
  }, [reminders, batchDismissReminders]);

  // Handle single dismiss with proper error handling
  const handleDismissSingle = useCallback((id: string) => {
    dismissReminder(id);
  }, [dismissReminder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full hover:bg-mint-50 transition-colors"
          aria-label={`${totalCount} reminders`}
        >
          <Bell className="h-5 w-5 text-mint-600" />
          {totalCount > 0 && (
            <Badge 
              className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs font-medium transition-all duration-200 ${
                hasOverdueReminders 
                  ? 'bg-red-500 text-white animate-heartbeat shadow-lg shadow-red-500/50' 
                  : 'bg-red-500 text-white shadow-md shadow-red-500/30 animate-heartbeat'
              }`}
            >
              {totalCount > 99 ? '99+' : totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 shadow-xl border-0 bg-white/95 backdrop-blur-sm" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-mint-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-mint-100 rounded-full">
              <Bell className="h-4 w-4 text-mint-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-mint-800">Reminders</h4>
              {totalCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-mint-600">
                  {pendingCount > 0 && (
                    <Badge variant="outline" className="bg-mint-50 text-mint-700 border-mint-200">
                      {pendingCount} pending
                    </Badge>
                  )}
                  {sentCount > 0 && (
                    <Badge variant="outline" className="bg-mint-50 text-mint-700 border-mint-200">
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
                disabled={isBatchDismissing}
                className="text-xs px-2 py-1 h-auto hover:bg-mint-100 text-mint-700"
              >
                {isBatchDismissing ? (
                  <>
                    <div className="w-3 h-3 border border-mint-500 border-t-transparent rounded-full animate-spin mr-1" />
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
              className="h-6 w-6 hover:bg-mint-100 text-mint-600"
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
            hasMore={hasMore}
            onDismiss={handleDismissSingle}
            onLoadMore={loadMore}
            isReminderDismissing={isReminderDismissing}
          />
        </div>

        {/* Footer */}
        {totalCount > 0 && (
          <div className="border-t px-4 py-2 bg-mint-50">
            <div className="flex items-center justify-center text-xs text-mint-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-mint-400 rounded-full animate-heartbeat"></div>
                <span>Optimized for {totalCount} reminders</span>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
