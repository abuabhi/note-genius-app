
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
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-mint-600" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'study_event':
        return 'bg-mint-25 border-mint-100 hover:bg-mint-50';
      case 'goal_deadline':
        return 'bg-mint-25 border-mint-100 hover:bg-mint-50';
      case 'flashcard_review':
        return 'bg-mint-25 border-mint-100 hover:bg-mint-50';
      case 'todo':
        return 'bg-orange-25 border-orange-100 hover:bg-orange-50';
      default:
        return 'bg-mint-25 border-mint-100 hover:bg-mint-50';
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
        group relative rounded-lg ${getTypeGradient(reminder.type)} 
        border transition-all duration-200 hover:shadow-sm
        ${overdue ? 'border-red-200 bg-red-25' : ''}
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      {/* Subtle priority indicator */}
      {overdue && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></div>
      )}
      
      <div className="relative flex items-start gap-3">
        {/* Icon with subtle background */}
        <div className={`
          flex-shrink-0 p-1.5 rounded-md bg-white/50 border border-white/60
          ${compact ? 'p-1' : 'p-1.5'}
        `}>
          {getTypeIcon(reminder.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`
                font-medium text-gray-900 leading-tight
                ${compact ? 'text-sm' : 'text-base'}
                ${overdue ? 'text-red-800' : ''}
              `}>
                {reminder.title}
              </h4>
              {reminder.description && !compact && (
                <p className={`
                  text-sm mt-1 leading-relaxed line-clamp-2
                  ${overdue ? 'text-red-700' : 'text-gray-600'}
                `}>
                  {reminder.description}
                </p>
              )}
            </div>
            
            {/* Type badge */}
            <Badge 
              variant="secondary" 
              className={`
                flex-shrink-0 bg-white/70 border-white/60 text-xs
                ${compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}
                ${overdue ? 'bg-red-50 text-red-700 border-red-100' : 'text-mint-700'}
              `}
            >
              {getTypeLabel(reminder.type)}
            </Badge>
          </div>
          
          {/* Time and status */}
          <div className="flex items-center justify-between mt-2">
            <div className={`
              flex items-center gap-1 text-xs
              ${overdue ? 'text-red-600' : 'text-gray-500'}
            `}>
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
                  hover:bg-gray-100
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
