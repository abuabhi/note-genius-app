
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Event } from '@/hooks/useEvents';
import { Badge } from '@/components/ui/badge';

interface UpcomingEventsListProps {
  events: Event[];
  isLoading: boolean;
  formatEventDate: (date: string) => string;
}

export const UpcomingEventsList: React.FC<UpcomingEventsListProps> = ({ 
  events, 
  isLoading, 
  formatEventDate 
}) => {
  if (isLoading) {
    return (
      <Card>
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
    <Card>
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
                      className="p-3 rounded-md border flex items-start gap-2"
                      style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge
                            variant={
                              event.event_type === 'study' ? 'default' : 
                              event.event_type === 'deadline' ? 'destructive' : 'secondary'
                            }
                          >
                            {event.event_type}
                          </Badge>
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
  );
};
