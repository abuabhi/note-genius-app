
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Event } from "@/hooks/useEvents";

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
}

export const EventCard = ({ event, onDelete }: EventCardProps) => {
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  
  const formatTime = (date: Date) => {
    return format(date, event.all_day ? 'MMM dd, yyyy' : 'MMM dd, yyyy h:mm a');
  };
  
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-2"
        style={{ backgroundColor: event.color }}
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{event.title}</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-secondary">
            {event.event_type}
          </span>
        </div>
        
        {event.description && (
          <p className="text-muted-foreground text-sm mt-2">
            {event.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatTime(startTime)} - {formatTime(endTime)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 bg-secondary/30">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(event.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </CardFooter>
    </Card>
  );
};
