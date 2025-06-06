
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const DateRangeFilter = ({ dateRange, setDateRange }: DateRangeFilterProps) => {
  const presetRanges = [
    {
      label: "Last 7 days",
      range: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    {
      label: "Last 30 days",
      range: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    {
      label: "Last 90 days",
      range: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    }
  ];

  const isPresetActive = (preset: typeof presetRanges[0]) => {
    return dateRange.start.getTime() === preset.range.start.getTime() &&
           dateRange.end.getTime() === preset.range.end.getTime();
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Date Range:</span>
      <div className="flex space-x-2">
        {presetRanges.map((preset) => (
          <Button
            key={preset.label}
            variant={isPresetActive(preset) ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(preset.range)}
            className={
              isPresetActive(preset)
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                : "hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
            }
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 pointer-events-auto"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="font-medium">
              {format(dateRange.start, "MMM dd")} - {format(dateRange.end, "MMM dd")}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <Calendar
            mode="range"
            selected={{
              from: dateRange.start,
              to: dateRange.end
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setDateRange({ start: range.from, end: range.to });
              }
            }}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
