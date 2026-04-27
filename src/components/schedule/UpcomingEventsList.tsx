import React, { useState } from 'react';
import { Calendar, Clock, Trash2, Target } from 'lucide-react';
import { format, isSameDay, differenceInCalendarDays, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Event } from '@/hooks/events';
import type { UpcomingGoal } from '@/hooks/events/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { getExamUrgency } from '@/utils/examUrgency';
import { cn } from '@/lib/utils';

interface UpcomingEventsListProps {
  events: Event[];
  goals?: UpcomingGoal[];
  isLoading: boolean;
  formatEventDate: (date: string) => string;
  onDeleteEvent?: (id: string) => void;
}

export const UpcomingEventsList: React.FC<UpcomingEventsListProps> = ({ 
  events, 
  goals = [],
  isLoading, 
  formatEventDate,
  onDeleteEvent 
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete && onDeleteEvent) {
      onDeleteEvent(eventToDelete);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-mint-100 shadow-sm">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  type GoalItem = { kind: 'goal'; goal: UpcomingGoal };
  type EventItem = { kind: 'event'; event: Event };
  type DayItem = EventItem | GoalItem;

  // Group events + goals by day
  const itemsByDay: Record<string, DayItem[]> = {};
  events.forEach(event => {
    const dateKey = format(new Date(event.start_time), 'yyyy-MM-dd');
    if (!itemsByDay[dateKey]) itemsByDay[dateKey] = [];
    itemsByDay[dateKey].push({ kind: 'event', event });
  });
  goals.forEach(goal => {
    // end_date is a date-only string (YYYY-MM-DD); avoid TZ shifts
    const dateKey = goal.end_date.length >= 10 ? goal.end_date.slice(0, 10) : format(parseISO(goal.end_date), 'yyyy-MM-dd');
    if (!itemsByDay[dateKey]) itemsByDay[dateKey] = [];
    itemsByDay[dateKey].push({ kind: 'goal', goal });
  });

  // Get unique days, sorted chronologically
  const days = Object.keys(itemsByDay).sort();

  return (
    <>
      <Card className="border border-mint-100 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-mint-50 to-mint-100/40 border-b border-mint-100">
          <CardTitle className="flex items-center gap-2 text-mint-800">
            <Calendar className="h-5 w-5 text-mint-600" />
            Upcoming Events (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {days.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border border-dashed border-mint-200 rounded-md bg-mint-50/30">
              No upcoming events in the next 7 days
            </div>
          ) : (
            <div className="space-y-4">
              {days.map(day => (
                <div key={day} className="space-y-2">
                  <h3 className="font-semibold text-sm text-mint-700 bg-mint-50 p-2 rounded-md">
                    {isSameDay(new Date(day), new Date()) 
                      ? 'Today' 
                      : format(new Date(day), 'EEEE, MMMM d')}
                  </h3>
                  <div className="space-y-2">
                    {itemsByDay[day].map(item => {
                      if (item.kind === 'goal') {
                        const goal = item.goal;
                        const dueDate = parseISO(goal.end_date);
                        const daysLeft = differenceInCalendarDays(dueDate, new Date());
                        const dueLabel =
                          daysLeft <= 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `Due in ${daysLeft} days`;
                        return (
                          <div
                            key={`goal-${goal.id}`}
                            className="p-3 rounded-md border border-mint-100 flex items-start gap-2 hover:shadow-sm transition-shadow bg-amber-50/40"
                            style={{ borderLeftColor: 'hsl(38 92% 50%)', borderLeftWidth: '4px' }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-mint-800 flex items-center gap-1.5">
                                  <Target className="h-4 w-4 text-amber-600" />
                                  {goal.title}
                                </h4>
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-amber-50">Goal due</Badge>
                              </div>
                              <div className="text-sm text-amber-700 mt-1">{dueLabel}</div>
                              {goal.description && (
                                <p className="text-sm mt-1 line-clamp-2 text-muted-foreground">{goal.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      }

                      const event = item.event;
                      const isExam = event.event_type === 'exam';
                      const examUrgency = isExam
                        ? getExamUrgency(differenceInCalendarDays(new Date(event.start_time), new Date()))
                        : null;
                      return (
                      <div 
                        key={event.id} 
                        className={cn(
                          'p-3 rounded-md border border-mint-100 flex items-start gap-2 hover:shadow-sm transition-shadow',
                          examUrgency?.emphasise && 'bg-amber-50/40',
                        )}
                        style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-mint-800">{event.title}</h4>
                            <div className="flex items-center gap-1">
                              {examUrgency?.emphasise && (
                                <Badge className={examUrgency.badgeClass}>{examUrgency.label}</Badge>
                              )}
                              <Badge
                                variant={
                                  event.event_type === 'study' ? 'default' :
                                  event.event_type === 'deadline' || event.event_type === 'exam' ? 'destructive' : 'secondary'
                                }
                                className={event.event_type === 'study' ? 'bg-mint-500 hover:bg-mint-600' : ''}
                              >
                                {event.event_type}
                              </Badge>
                              
                              {onDeleteEvent && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2"
                                  onClick={() => handleDeleteClick(event.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-mint-600 flex items-center mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                          </div>
                          
                          {event.is_recurring && (
                            <Badge variant="outline" className="mt-1 border-mint-200 text-mint-700">
                              Recurring: {event.recurrence_pattern?.pattern ?? 'Custom'}
                            </Badge>
                          )}
                          
                          {event.description && (
                            <p className="text-sm mt-1 line-clamp-2 text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border border-mint-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-mint-200 text-mint-700">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
