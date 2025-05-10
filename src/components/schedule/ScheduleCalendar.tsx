import React, { useState, useEffect } from 'react';
import { Calendar as CalendarComponent, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '@/hooks/events';
import { EventCard } from './EventCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateEventDialog } from './CreateEventDialog';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ScheduleCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const localizer = momentLocalizer(moment);

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ selectedDate, onDateChange }) => {
  const { events, isLoading, error, createEvent, deleteEvent, refetchEvents } = useEvents(selectedDate);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formattedEvents, setFormattedEvents] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Handle any errors from the useEvents hook
  useEffect(() => {
    if (error) {
      console.error('Error fetching events:', error);
      toast.error("Error loading events. Please try again later.", {
        id: "events-error",
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
    refetchEvents();
    toast.success("Event created successfully");
  };

  const handleDeleteEvent = (event: any) => {
    setSelectedEvent(event);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedEvent) {
      try {
        await deleteEvent.mutateAsync(selectedEvent.id);
        toast.success("Event deleted successfully");
      } catch (error) {
        toast.error("Failed to delete event");
        console.error("Delete event error:", error);
      }
      setShowDeleteDialog(false);
    }
  };

  // Custom event styling for the calendar
  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: event.color || '#3dc087',
      borderRadius: '4px',
      opacity: 0.9,
      color: '#fff',
      border: '0px',
      display: 'block',
      fontWeight: 500,
      padding: '2px 5px',
      fontSize: '90%',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    };
    return {
      style
    };
  };

  if (isLoading) {
    return (
      <Card className="p-4 shadow-sm border border-mint-100">
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
        <Button onClick={() => setShowCreateDialog(true)} className="bg-mint-500 hover:bg-mint-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>
      
      <Card className="p-4 h-[70vh] border border-mint-100 shadow-sm">
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
          views={['month', 'week', 'day']}
          popup
          components={{
            event: (eventProps) => <div className="truncate px-1 text-white">{eventProps.title}</div>
          }}
          eventPropGetter={eventStyleGetter}
          className="custom-calendar"
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete event "{selectedEvent?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
