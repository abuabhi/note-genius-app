
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent, View, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parseISO } from 'date-fns';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from './EventCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateEventDialog } from './CreateEventDialog';
import { toast } from 'sonner';

interface ScheduleCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const localizer = momentLocalizer(moment);

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ selectedDate, onDateChange }) => {
  const { events, isLoading, error, createEvent, deleteEvent, refetchEvents } = useEvents(selectedDate);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const [formattedEvents, setFormattedEvents] = useState<any[]>([]);

  // Handle any errors from the useEvents hook
  useEffect(() => {
    if (error) {
      console.error('Error fetching events:', error);
      // Show error toast only once, not in an infinite loop
      toast.error("Error loading events. Please try again later.", {
        id: "events-error", // Use an ID to prevent duplicate toasts
      });
    }
  }, [error]);

  useEffect(() => {
    if (events) {
      const formatted = events.map(event => ({
        ...event,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        title: event.title,
      }));
      setFormattedEvents(formatted);
    }
  }, [events]);

  const handleSelectSlot = ({ start }: { start: Date }) => {
    onDateChange(start);
    setShowCreateDialog(true);
  };
  
  const handleEventCreated = () => {
    // Refetch events after a new event is created
    refetchEvents();
    toast.success("Event created successfully");
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>
      
      <Card className="p-4 h-[70vh]">
        <CalendarComponent
          localizer={localizer}
          events={formattedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          date={selectedDate}
          onNavigate={date => onDateChange(date)}
          selectable
          onSelectSlot={handleSelectSlot}
          defaultView="month"
          popup
          components={{
            event: EventCard as any
          }}
        />
      </Card>

      {showCreateDialog && (
        <CreateEventDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onEventCreated={handleEventCreated}
          selectedDate={selectedDate}
        />
      )}
    </>
  );
};
