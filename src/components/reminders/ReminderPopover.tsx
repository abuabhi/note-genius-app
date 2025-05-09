
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RemindersList } from './RemindersList';
import { useReminders } from '@/hooks/useReminders';

export const ReminderPopover = () => {
  const { reminders, isLoading, dismissReminder } = useReminders();
  const [open, setOpen] = useState(false);
  
  // Count pending reminders (not dismissed)
  const pendingCount = reminders.filter(r => r.status === 'pending').length;
  
  // Get any overdue reminders
  const now = new Date();
  const hasOverdueReminders = reminders.some(
    r => r.status === 'pending' && new Date(r.reminder_time) < now
  );
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <Badge 
              className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs ${
                hasOverdueReminders ? 'bg-red-500' : 'bg-primary'
              }`}
            >
              {pendingCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium">Reminders</h4>
          {pendingCount > 0 && (
            <Badge variant="outline">{pendingCount} pending</Badge>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          <RemindersList 
            reminders={reminders}
            loading={isLoading}
            onDismiss={(id) => dismissReminder.mutate(id)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
