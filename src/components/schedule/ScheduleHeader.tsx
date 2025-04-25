
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";

export const ScheduleHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Schedule</h1>
      <Button>
        <CalendarPlus className="mr-2 h-4 w-4" />
        Add Event
      </Button>
    </div>
  );
};
