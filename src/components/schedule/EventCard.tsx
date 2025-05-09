
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/hooks/useEvents";

export const EventCard = (props: any) => {
  const { event, onDelete = () => {} } = props;
  
  if (!event) {
    return null;
  }
  
  // Handle both start_time and start (from formatting in calendar)
  const startTime = new Date(event.start_time || event.start || new Date());
  const endTime = new Date(event.end_time || event.end || new Date());
  
  const formatTime = (date: Date) => {
    try {
      return format(date, event.all_day ? 'MMM dd, yyyy' : 'MMM dd, yyyy h:mm a');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };
  
  return (
    <div className="p-2">
      <Card className="overflow-hidden">
        <div 
          className="h-2"
          style={{ backgroundColor: event.color || '#4f46e5' }}
        />
        <CardContent className="p-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{event.title || 'Untitled Event'}</h3>
            {event.event_type && (
              <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                {event.event_type}
              </span>
            )}
          </div>
          
          {event.description && (
            <p className="text-muted-foreground text-xs mt-1">
              {event.description}
            </p>
          )}
          
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatTime(startTime)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
