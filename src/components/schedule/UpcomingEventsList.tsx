
import React, { useState } from 'react';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Event } from '@/hooks/useEvents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface UpcomingEventsListProps {
  events: Event[];
  isLoading: boolean;
  formatEventDate: (date: string) => string;
  onDeleteEvent?: (id: string) => void;
}

export const UpcomingEventsList: React.FC<UpcomingEventsListProps> = ({ 
  events, 
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
      <Card className="border shadow-sm">
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

  // Group events by day
  const eventsByDay: Record<string, Event[]> = {};
  events.forEach(event => {
    const date = new Date(event.start_time);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    if (!eventsByDay[dateKey]) {
      eventsByDay[dateKey] = [];
    }
    eventsByDay[dateKey].push(event);
  });

  // Get unique days, sorted chronologically
  const days = Object.keys(eventsByDay).sort();

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {days.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No upcoming events in the next 7 days
            </div>
          ) : (
            <div className="space-y-4">
              {days.map(day => (
                <div key={day} className="space-y-2">
                  <h3 className="font-semibold text-sm">
                    {isSameDay(new Date(day), new Date()) 
                      ? 'Today' 
                      : format(new Date(day), 'EEEE, MMMM d')}
                  </h3>
                  <div className="space-y-2">
                    {eventsByDay[day].map(event => (
                      <div 
                        key={event.id} 
                        className="p-3 rounded-md border flex items-start gap-2 hover:shadow-sm transition-shadow"
                        style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{event.title}</h4>
                            <div className="flex items-center gap-1">
                              <Badge
                                variant={
                                  event.event_type === 'study' ? 'default' : 
                                  event.event_type === 'deadline' ? 'destructive' : 'secondary'
                                }
                                className="mr-2"
                              >
                                {event.event_type}
                              </Badge>
                              
                              {onDeleteEvent && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteClick(event.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                          </div>
                          
                          {event.is_recurring && (
                            <Badge variant="outline" className="mt-1">
                              Recurring: {event.recurrence_pattern?.pattern ?? 'Custom'}
                            </Badge>
                          )}
                          
                          {event.description && (
                            <p className="text-sm mt-1 line-clamp-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
