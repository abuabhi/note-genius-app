
import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { StudyPlanSession } from '@/types/studyPlanner';
import { format } from 'date-fns';

interface StudySessionsCalendarProps {
  sessions: StudyPlanSession[];
  onSessionClick?: (session: StudyPlanSession) => void;
  onDateClick?: (date: Date) => void;
  onSessionDrop?: (sessionId: string, newDate: string, newStartTime: string, newEndTime: string) => void;
}

export const StudySessionsCalendar = ({
  sessions,
  onSessionClick,
  onDateClick,
  onSessionDrop,
}: StudySessionsCalendarProps) => {
  const calendarEvents = useMemo(() => {
    return sessions.map((session) => {
      const startDateTime = `${session.scheduled_date}T${session.scheduled_start_time}`;
      const endDateTime = `${session.scheduled_date}T${session.scheduled_end_time}`;
      
      // Color coding by status
      const getEventColor = (status: string) => {
        switch (status) {
          case 'scheduled': return '#3b82f6'; // blue
          case 'in_progress': return '#f59e0b'; // orange
          case 'completed': return '#10b981'; // green
          case 'skipped': return '#6b7280'; // gray
          case 'rescheduled': return '#8b5cf6'; // purple
          default: return '#6b7280';
        }
      };

      return {
        id: session.id,
        title: session.title,
        start: startDateTime,
        end: endDateTime,
        backgroundColor: getEventColor(session.status),
        borderColor: getEventColor(session.status),
        extendedProps: {
          session,
          topic: session.topic,
          priority: session.priority,
          status: session.status,
          description: session.description,
        },
      };
    });
  }, [sessions]);

  const handleEventClick = (clickInfo: any) => {
    const session = clickInfo.event.extendedProps.session;
    if (onSessionClick) {
      onSessionClick(session);
    }
  };

  const handleDateClick = (clickInfo: any) => {
    if (onDateClick) {
      onDateClick(clickInfo.date);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    if (onSessionDrop) {
      const session = dropInfo.event.extendedProps.session;
      const newDate = format(dropInfo.event.start, 'yyyy-MM-dd');
      const newStartTime = format(dropInfo.event.start, 'HH:mm:ss');
      const newEndTime = format(dropInfo.event.end || dropInfo.event.start, 'HH:mm:ss');
      
      onSessionDrop(session.id, newDate, newStartTime, newEndTime);
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const { session } = eventInfo.event.extendedProps;
    return (
      <div className="p-1 text-xs">
        <div className="font-medium truncate">{eventInfo.event.title}</div>
        {session.topic && (
          <div className="text-white/80 truncate">{session.topic}</div>
        )}
        <div className="text-white/60">{session.duration_minutes}min</div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        initialView="timeGridWeek"
        height="100%"
        events={calendarEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        editable={true}
        droppable={true}
        eventContent={renderEventContent}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        dayMaxEventRows={3}
        eventDisplay="block"
        eventBackgroundColor="transparent"
        eventBorderColor="transparent"
        eventTextColor="white"
        nowIndicator={true}
        weekends={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
          startTime: '08:00',
          endTime: '22:00',
        }}
      />
    </div>
  );
};
