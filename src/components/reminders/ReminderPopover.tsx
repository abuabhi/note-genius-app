
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RemindersList } from './RemindersList';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';

export const ReminderPopover = () => {
  const { 
    reminders, 
    totalCount,
    isLoading, 
    dismissReminder 
  } = useUnifiedReminderSystem({
    limit: 1000,
    enableRealtime: true,
    enableNotifications: true
  });
  const [open, setOpen] = useState(false);
  
  // Count pending reminders (not dismissed/cancelled) - UNIFIED SYSTEM ONLY
  const pendingCount = reminders.filter(r => r.status === 'pending').length;
  
  // Get any overdue reminders
  const now = new Date();
  const hasOverdueReminders = reminders.some(
    r => r.status === 'pending' && new Date(r.reminder_time) < now
  );
  
  console.log('🔔 ReminderPopover - UNIFIED SYSTEM ONLY - Total:', totalCount, 'Pending:', pendingCount);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <Badge 
              className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs ${
                hasOverdueReminders ? 'bg-red-500' : 'bg-primary'
              }`}
            >
              {totalCount > 99 ? '99+' : totalCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium">Reminders (Unified System)</h4>
          {totalCount > 0 && (
            <Badge variant="outline">
              {totalCount} total {pendingCount > 0 && `(${pendingCount} pending)`}
            </Badge>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <RemindersList 
            reminders={reminders}
            loading={isLoading}
            onDismiss={(id) => {
              console.log('🗑️ Dismissing via UNIFIED SYSTEM:', id);
              dismissReminder(id);
              return Promise.resolve(true);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
