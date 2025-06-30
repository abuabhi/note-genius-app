
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, X, CalendarClock, BrainCircuit, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReminderCardProps {
  reminder: {
    id: string;
    title: string;
    description?: string;
    reminder_time: string;
    type: string;
    status?: string;
  };
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

export const ReminderCard = ({ reminder, onDismiss, compact = false }: ReminderCardProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study_event':
        return <Clock className="h-4 w-4 text-mint-600" />;
      case 'goal_deadline':
        return <CalendarClock className="h-4 w-4 text-mint-600" />;
      case 'flashcard_review':
        return <BrainCircuit className="h-4 w-4 text-mint-600" />;
      case 'todo':
        return <AlertTriangle className="h-4 w-4 text-mint-600" />;
      default:
        return <Bell className="h-4 w-4 text-mint-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'study_event':
        return 'Study';
      case 'goal_deadline':
        return 'Goal';
      case 'flashcard_review':
        return 'Review';
      case 'todo':
        return 'Todo';
      default:
        return 'Reminder';
    }
  };

  const getRelativeTime = (reminderTime: string) => {
    try {
      return formatDistanceToNow(new Date(reminderTime), { addSuffix: true });
    } catch {
      return 'Soon';
    }
  };

  const isOverdue = (reminderTime: string) => {
    try {
      return new Date(reminderTime) < new Date();
    } catch {
      return false;
    }
  };

  const overdue = isOverdue(reminder.reminder_time);

  return (
    <div 
      className={`
        group relative rounded-lg bg-mint-50 border-2 border-mint-400 
        transition-all duration-200 hover:shadow-sm hover:bg-mint-100
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      {/* Subtle priority indicator */}
      {overdue && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-mint-500 rounded-full"></div>
      )}
      
      <div className="relative flex items-start gap-3">
        {/* Icon with mint background */}
        <div className={`
          flex-shrink-0 p-1.5 rounded-md bg-mint-200 border border-mint-300
          ${compact ? 'p-1' : 'p-1.5'}
        `}>
          {getTypeIcon(reminder.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`
                font-medium leading-tight text-mint-800
                ${compact ? 'text-sm' : 'text-base'}
              `}>
                {reminder.title}
              </h4>
              {reminder.description && !compact && (
                <p className="text-sm mt-1 leading-relaxed line-clamp-2 text-mint-700">
                  {reminder.description}
                </p>
              )}
            </div>
            
            {/* Type badge */}
            <Badge className={`
              flex-shrink-0 bg-mint-200 border-mint-300 text-mint-800
              ${compact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'}
            `}>
              {getTypeLabel(reminder.type)}
            </Badge>
          </div>
          
          {/* Time and status */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-mint-600">
              <Clock className="h-3 w-3" />
              <span className="font-medium">
                {overdue ? 'Overdue' : 'Due'} {getRelativeTime(reminder.reminder_time)}
              </span>
            </div>
            
            {/* Dismiss button */}
            {onDismiss && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                  hover:bg-mint-200 text-mint-600
                  ${compact ? 'h-6 w-6 p-0' : 'h-7 w-7 p-0'}
                `}
                onClick={() => onDismiss(reminder.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
