
import React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface ScheduleHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ selectedDate, onDateChange }) => {
  const goToToday = () => {
    onDateChange(new Date());
  };

  const goToPreviousMonth = () => {
    onDateChange(subMonths(selectedDate, 1));
  };

  const goToNextMonth = () => {
    onDateChange(addMonths(selectedDate, 1));
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
    }
  };

  const currentMonth = format(selectedDate, "MMMM yyyy");

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <h1 className="text-3xl font-bold mb-4 md:mb-0">Schedule</h1>
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={goToToday}>
          Today
        </Button>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentMonth}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
                initialFocus
                month={selectedDate}
                fromMonth={startOfMonth(selectedDate)}
                toMonth={endOfMonth(selectedDate)}
              />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
