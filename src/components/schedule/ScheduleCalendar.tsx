
import React, { useState, useCallback, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg, EventClickArg } from '@fullcalendar/interaction';
import { INITIAL_EVENTS, createEventId } from './event-utils';
import CreateEventDialog from './CreateEventDialog';
import { useAuth } from '@/contexts/auth';

interface ScheduleCalendarProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function ScheduleCalendar({ selectedDate, onDateChange }: ScheduleCalendarProps) {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const { user } = useAuth();

  const handleEventCreated = useCallback(() => {
    // Refresh events or add additional logic as needed
    console.log("Event created successfully");
  }, []);

  const handleDateClick = useCallback((clickInfo: DateClickArg) => {
    setClickedDate(clickInfo.date);
    setIsDialogOpen(true);
    if (onDateChange) {
      onDateChange(clickInfo.date);
    }
  }, [onDateChange]);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }
  }, []);

  const handleEvents = useCallback((events) => {
    setCurrentEvents(events);
  }, []);

  const handleDatesSet = useCallback((dateInfo) => {
    console.log("Dates Set", dateInfo);
  }, []);

  const renderEventContent = (eventInfo: any) => {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </>
    );
  };

  const renderSidebarEvent = (event: any) => {
    return (
      <li key={event.id}>
        <b>{event.title}</b>
      </li>
    );
  };

  const events = INITIAL_EVENTS;

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col lg:h-[700px]">
      <div className="flex-grow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={weekendsVisible}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDidMount={renderEventContent}
          datesSet={handleDatesSet}
          eventAdd={e => console.log("Event Added", e)}
          eventChange={e => console.log("Event Changed", e)}
          eventRemove={e => console.log("Event Removed", e)}
          height="100%"
        />
      </div>
      {user && (
        <CreateEventDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onEventCreated={handleEventCreated}
          defaultDate={clickedDate}
        />
      )}
    </div>
  );
}

export default ScheduleCalendar;
