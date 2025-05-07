
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useEvents, Event } from "@/hooks/useEvents";
import { EventCard } from "./EventCard";
import { CreateEventDialog } from "./CreateEventDialog";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ScheduleCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const {
    events,
    dueFlashcards,
    isLoading,
    deleteEvent,
    updateDateRange
  } = useEvents(date);
  
  // Function to check if a date has events
  const hasEvents = (day: Date | undefined) => {
    if (!day || !events) return false;
    
    return events.some(
      (event) => new Date(event.start_time).toDateString() === day.toDateString()
    );
  };
  
  // Function to check if a date has due flashcards
  const hasDueFlashcards = (day: Date | undefined) => {
    if (!day || !dueFlashcards) return false;
    
    return dueFlashcards.some(
      (card) => new Date(card.next_review_at).toDateString() === day.toDateString()
    );
  };
  
  // Handle date change and update events accordingly
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      updateDateRange(newDate);
    }
  };
  
  // Get events for the selected date
  const filteredEvents: Event[] = events.filter(
    (event) => date && new Date(event.start_time).toDateString() === date.toDateString()
  );
  
  // Get due flashcards for the selected date
  const filteredDueFlashcards = dueFlashcards.filter(
    (card) => date && new Date(card.next_review_at).toDateString() === date.toDateString()
  );

  return (
    <Card className="p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            className="rounded-md border w-full pointer-events-auto"
            modifiers={{
              hasEvent: (date) => hasEvents(date),
              dueFlashcards: (date) => hasDueFlashcards(date)
            }}
            modifiersStyles={{
              hasEvent: { fontWeight: 'bold', backgroundColor: '#e5deff' },
              dueFlashcards: { fontWeight: 'bold', border: '2px solid #4f46e5' }
            }}
          />
          
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-200" />
              <span className="text-xs">Event</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-indigo-500" />
              <span className="text-xs">Due Flashcards</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {date ? format(date, 'MMMM d, yyyy') : ''}
            </h2>
            
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-secondary"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              + Add Event
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.length === 0 && filteredDueFlashcards.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No events scheduled for this day
                </p>
              ) : (
                <>
                  {filteredEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event}
                      onDelete={(id) => deleteEvent.mutate(id)}
                    />
                  ))}
                  
                  {filteredDueFlashcards.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Due Flashcards</h3>
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
                        <p className="text-sm">
                          You have <span className="font-bold">{filteredDueFlashcards.length}</span> flashcards due for review today.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      <CreateEventDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        selectedDate={date}
        onEventCreated={() => {}} 
      />
    </Card>
  );
};
