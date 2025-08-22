import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface StudySessionDateFilterProps {
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
}

export const StudySessionDateFilter = ({ dateRange, setDateRange }: StudySessionDateFilterProps) => {
  const presets = [
    {
      label: 'Last 7 days',
      range: { start: subDays(new Date(), 7), end: new Date() }
    },
    {
      label: 'Last 30 days', 
      range: { start: subDays(new Date(), 30), end: new Date() }
    },
    {
      label: 'Last 90 days',
      range: { start: subDays(new Date(), 90), end: new Date() }
    },
    {
      label: 'This week',
      range: { start: startOfWeek(new Date()), end: endOfWeek(new Date()) }
    },
    {
      label: 'This month',
      range: { start: startOfMonth(new Date()), end: endOfMonth(new Date()) }
    }
  ];

  const isPresetActive = (presetRange: { start: Date; end: Date }) => {
    return (
      dateRange.start.toDateString() === presetRange.start.toDateString() &&
      dateRange.end.toDateString() === presetRange.end.toDateString()
    );
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ start: range.from, end: range.to });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-1">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant={isPresetActive(preset.range) ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(preset.range)}
            className="text-xs h-8"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Custom Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs h-8">
            <CalendarIcon className="h-3 w-3 mr-2" />
            {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d')}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.start}
            selected={{
              from: dateRange.start,
              to: dateRange.end,
            }}
            onSelect={handleDateRangeSelect}
            numberOfMonths={2}
            className="border-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};