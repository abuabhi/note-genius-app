
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

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Date Range:</span>
      <div className="flex space-x-2">
        {presetRanges.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => setDateRange(preset.range)}
            className={
              dateRange.start.getTime() === preset.range.start.getTime() &&
              dateRange.end.getTime() === preset.range.end.getTime()
                ? "bg-primary text-primary-foreground"
                : ""
            }
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(dateRange.start, "MMM dd")} - {format(dateRange.end, "MMM dd")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
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
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
