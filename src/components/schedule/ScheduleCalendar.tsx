
import { useState, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';
import CreateEventDialog from './CreateEventDialog';
import { useAuth } from '@/contexts/auth';
import { confirmDialog } from '@/components/ui/confirm-dialog';
import { useEvents } from '@/hooks/events';
import { useSimplifiedGoals } from '@/hooks/useSimplifiedGoals';
import { useExams } from '@/hooks/exams/useExams';
import { toast } from 'sonner';

interface ScheduleCalendarProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

type SourceKind = 'event' | 'exam' | 'goal-end';

interface ScheduleEventExtendedProps {
  source: SourceKind;
  recordId: string;
}

export function ScheduleCalendar({ selectedDate, onDateChange }: ScheduleCalendarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const { user } = useAuth();

  const { events, deleteEvent, refetchEvents, refetchUpcomingEvents } = useEvents(selectedDate);
  const { goals } = useSimplifiedGoals();
  const { exams, deleteExam } = useExams();

  // Merge events from three sources, mapped to FullCalendar EventInput shape.
  // Exams created with createCalendarEvent already have a row in `events` with
  // event_type='exam', so to avoid duplicates we only render standalone exams
  // (those without event_id) from the exams list.
  const calendarEvents = useMemo<EventInput[]>(() => {
    const fromEvents: EventInput[] = (events || []).map((e: any) => {
      const isExam = e.event_type === 'exam';
      return {
        id: `event:${e.id}`,
        title: e.title,
        start: e.start_time,
        end: e.end_time || undefined,
        allDay: !!e.all_day,
        classNames: [isExam ? 'fc-event-exam' : 'fc-event-default'],
        extendedProps: {
          source: 'event' as SourceKind,
          recordId: e.id,
        } satisfies ScheduleEventExtendedProps,
      };
    });

    const fromExams: EventInput[] = (exams || [])
      .filter((x: any) => !x.event_id)
      .map((x: any) => ({
        id: `exam:${x.id}`,
        title: `Exam: ${x.title}`,
        start: x.exam_date,
        allDay: true,
        classNames: ['fc-event-exam'],
        extendedProps: {
          source: 'exam' as SourceKind,
          recordId: x.id,
        } satisfies ScheduleEventExtendedProps,
      }));

    const fromGoals: EventInput[] = (goals || []).flatMap((g: any) => {
      const items: EventInput[] = [];
      if (g.end_date) {
        items.push({
          id: `goal-end:${g.id}`,
          title: `Goal due: ${g.title}`,
          start: g.end_date,
          allDay: true,
          classNames: ['fc-event-goal'],
          extendedProps: {
            source: 'goal-end' as SourceKind,
            recordId: g.id,
          } satisfies ScheduleEventExtendedProps,
        });
      }
      return items;
    });

    return [...fromEvents, ...fromExams, ...fromGoals];
  }, [events, exams, goals]);

  const handleDateClick = useCallback((clickInfo: any) => {
    setClickedDate(clickInfo.date);
    setIsDialogOpen(true);
    onDateChange?.(clickInfo.date);
  }, [onDateChange]);

  const handleEventClick = useCallback(async (clickInfo: any) => {
    const props = clickInfo.event.extendedProps as ScheduleEventExtendedProps;
    const title = clickInfo.event.title;

    if (props.source === 'goal-end') {
      toast.info('Manage this goal from the Study Goals page.');
      return;
    }

    if (props.source === 'exam') {
      const ok = await confirmDialog({
        title: 'Delete exam?',
        description: `Remove "${title}" from your schedule? This will also delete the exam.`,
        confirmText: 'Delete',
        destructive: true,
      });
      if (!ok) return;
      try {
        const exam = (exams || []).find((x: any) => x.id === props.recordId);
        if (exam) await deleteExam(exam);
      } catch (err) {
        console.error('Delete exam error:', err);
        toast.error('Failed to delete exam');
      }
      return;
    }

    // Default: event row in the events table
    const ok = await confirmDialog({
      title: 'Delete event?',
      description: `Are you sure you want to delete "${title}"?`,
      confirmText: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteEvent.mutateAsync(props.recordId);
      toast.success('Event deleted');
      refetchEvents();
      refetchUpcomingEvents();
    } catch (err) {
      console.error('Delete event error:', err);
      toast.error('Failed to delete event');
    }
  }, [deleteEvent, deleteExam, exams, refetchEvents, refetchUpcomingEvents]);

  const handleEventCreated = useCallback(() => {
    refetchEvents();
    refetchUpcomingEvents();
  }, [refetchEvents, refetchUpcomingEvents]);

  return (
    <div className="schedule-calendar h-[calc(100vh-260px)] flex flex-col lg:h-[700px] rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex-grow">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="dayGridMonth"
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="100%"
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
          Events
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-destructive" />
          Exams
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />
          Goals
        </span>
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
