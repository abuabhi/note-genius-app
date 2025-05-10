
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/hooks/useEvents";

interface EventCardProps {
  event: any;
  onDelete?: (event: any) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onDelete }) => {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(event);
    }
  };
  
  return (
    <div className="p-2">
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 border border-mint-100">
        <div 
          className="h-3"
          style={{ backgroundColor: event.color || '#3dc087' }}
        />
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-mint-800">{event.title || 'Untitled Event'}</h3>
            <div className="flex items-center">
              {event.event_type && (
                <span className="text-xs px-2 py-1 rounded-full bg-mint-50 text-mint-700 mr-2">
                  {event.event_type}
                </span>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          </div>
          
          {event.description && (
            <p className="text-muted-foreground text-xs mt-2">
              {event.description}
            </p>
          )}
          
          <div className="flex items-center gap-1 mt-2 text-xs text-mint-700">
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
