
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { CreateEventDialog } from "./CreateEventDialog";

export const ScheduleHeader = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Schedule</h1>
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <CalendarPlus className="mr-2 h-4 w-4" />
        Add Event
      </Button>
      
      <CreateEventDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        onEventCreated={() => {}} 
      />
    </div>
  );
};
