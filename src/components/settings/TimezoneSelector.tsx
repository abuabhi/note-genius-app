
import { useTimezone } from '@/hooks/useTimezone';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { COMPREHENSIVE_TIMEZONES, getTimezonesByRegion, getCurrentTimeInTimezone } from '@/utils/timezoneData';

export const TimezoneSelector = () => {
  const { timezone, updateTimezone, isLoading } = useTimezone();
  const timezonesByRegion = getTimezonesByRegion();

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
        <SelectContent className="max-h-80">
          {Object.entries(timezonesByRegion).map(([region, timezones]) => (
            <div key={region}>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                {region}
              </div>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  <div className="flex flex-col">
                    <span>{tz.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {tz.offset} • Current: {getCurrentTimeInTimezone(tz.value)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        Your timezone is used to calculate daily and weekly study statistics accurately.
        Current time: {getCurrentTimeInTimezone(timezone)}
      </p>
    </div>
  );
};
