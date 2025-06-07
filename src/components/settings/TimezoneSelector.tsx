
import { useTimezone } from '@/hooks/useTimezone';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

// Common timezones - you can expand this list
const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Australia/Melbourne', label: 'Melbourne' },
];

export const TimezoneSelector = () => {
  const { timezone, updateTimezone, isLoading } = useTimezone();

  const handleTimezoneChange = (newTimezone: string) => {
    updateTimezone(newTimezone);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="timezone" className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Timezone
      </Label>
      <Select 
        value={timezone} 
        onValueChange={handleTimezoneChange}
        disabled={isLoading}
      >
        <SelectTrigger id="timezone">
          <SelectValue placeholder="Select your timezone" />
        </SelectTrigger>
        <SelectContent>
          {COMMON_TIMEZONES.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        Your timezone is used to calculate daily and weekly study statistics accurately.
        Current time: {new Date().toLocaleString(undefined, { timeZone: timezone })}
      </p>
    </div>
  );
};
