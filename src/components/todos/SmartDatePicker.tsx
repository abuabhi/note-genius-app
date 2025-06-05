
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useSmartSuggestions } from "@/hooks/todos/useSmartSuggestions";

interface SmartDatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export const SmartDatePicker: React.FC<SmartDatePickerProps> = ({
  date,
  onDateChange,
  placeholder = "Pick a date"
}) => {
  const { getSmartDateSuggestions } = useSmartSuggestions();
  const suggestions = getSmartDateSuggestions();

  return (
    <div className="space-y-3">
      {/* Smart Suggestions */}
      <div className="grid grid-cols-2 gap-2">
        {suggestions.slice(0, 4).map((suggestion) => (
          <Button
            key={suggestion.label}
            variant={date && format(date, 'yyyy-MM-dd') === format(suggestion.date, 'yyyy-MM-dd') ? "default" : "outline"}
            size="sm"
            onClick={() => onDateChange(suggestion.date)}
            className="h-8 text-xs"
          >
            <span className="mr-1">{suggestion.icon}</span>
            {suggestion.label}
          </Button>
        ))}
      </div>

      {/* Custom Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
