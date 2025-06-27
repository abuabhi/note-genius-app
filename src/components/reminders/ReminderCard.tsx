
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
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'goal_deadline':
        return <CalendarClock className="h-4 w-4 text-green-500" />;
      case 'flashcard_review':
        return <BrainCircuit className="h-4 w-4 text-purple-500" />;
      case 'todo':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'study_event':
        return 'from-blue-50 via-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150';
      case 'goal_deadline':
        return 'from-green-50 via-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-150';
      case 'flashcard_review':
        return 'from-purple-50 via-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-150';
      case 'todo':
        return 'from-orange-50 via-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-150';
      default:
        return 'from-gray-50 via-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-150';
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
        group relative rounded-xl bg-gradient-to-br ${getTypeGradient(reminder.type)} 
        border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]
        ${overdue ? 'ring-2 ring-red-200 bg-gradient-to-br from-red-50 to-red-100 border-red-200' : ''}
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      {/* Priority indicator */}
      {overdue && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl pointer-events-none"></div>
      
      <div className="relative flex items-start gap-3">
        {/* Icon with animated background */}
        <div className={`
          flex-shrink-0 p-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm
          ${compact ? 'p-1.5' : 'p-2'}
        `}>
          {getTypeIcon(reminder.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`
                font-semibold text-gray-900 leading-tight
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
                flex-shrink-0 bg-white/70 backdrop-blur-sm border-white/40 shadow-sm
                ${compact ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1'}
                ${overdue ? 'bg-red-100 text-red-700 border-red-200' : 'text-gray-700'}
              `}
            >
              {getTypeLabel(reminder.type)}
            </Badge>
          </div>
          
          {/* Time and status */}
          <div className="flex items-center justify-between mt-3">
            <div className={`
              flex items-center gap-1 text-xs
              ${overdue ? 'text-red-600' : 'text-gray-500'}
            `}>
              <Clock className="h-3 w-3" />
              <span className="font-medium">
                {overdue ? 'Overdue' : 'Due'} {getRelativeTime(reminder.reminder_time)}
              </span>
              {overdue && (
                <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0.5 bg-red-500 animate-pulse">
                  !
                </Badge>
              )}
            </div>
            
            {/* Dismiss button */}
            {onDismiss && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`
                  opacity-0 group-hover:opacity-100 transition-all duration-200 
                  hover:bg-white/60 backdrop-blur-sm
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
