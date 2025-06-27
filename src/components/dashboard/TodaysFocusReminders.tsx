
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, X, CheckCircle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminder_time?: string;
  type: string;
  status?: string;
}

interface TodaysFocusRemindersProps {
  reminders: Reminder[];
}

export const TodaysFocusReminders = ({ reminders }: TodaysFocusRemindersProps) => {
  if (reminders.length === 0) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study_event':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'goal_deadline':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'flashcard_review':
        return <Bell className="h-4 w-4 text-purple-500" />;
      case 'todo':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'study_event':
        return 'from-blue-50 to-blue-100 border-blue-200';
      case 'goal_deadline':
        return 'from-green-50 to-green-100 border-green-200';
      case 'flashcard_review':
        return 'from-purple-50 to-purple-100 border-purple-200';
      case 'todo':
        return 'from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
          <Bell className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Due Today</h3>
          <p className="text-sm text-gray-600">{reminders.length} reminder{reminders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {reminders.slice(0, 3).map((reminder) => {
          const overdue = reminder.reminder_time ? isOverdue(reminder.reminder_time) : false;
          
          return (
            <div 
              key={reminder.id} 
              className={`
                relative group p-4 rounded-xl bg-gradient-to-r ${getTypeGradient(reminder.type)} 
                border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]
                ${overdue ? 'ring-2 ring-red-200 bg-gradient-to-r from-red-50 to-red-100' : ''}
              `}
            >
              {/* Overdue indicator */}
              {overdue && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
              
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(reminder.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm leading-5 ${overdue ? 'text-red-800' : 'text-gray-900'}`}>
                        {reminder.title}
                      </h4>
                      {reminder.description && (
                        <p className={`text-xs mt-1 leading-4 ${overdue ? 'text-red-700' : 'text-gray-600'}`}>
                          {reminder.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Badge */}
                    <Badge 
                      variant="outline" 
                      className={`
                        text-xs flex-shrink-0 ${
                          overdue 
                            ? 'border-red-300 text-red-700 bg-red-50' 
                            : 'border-current text-current bg-white/50'
                        }
                      `}
                    >
                      {reminder.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {/* Time info */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className={`text-xs flex items-center gap-1 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                      <Clock className="h-3 w-3" />
                      {reminder.reminder_time ? (
                        <span>
                          {overdue ? 'Overdue' : 'Due'} {getRelativeTime(reminder.reminder_time)}
                        </span>
                      ) : (
                        <span>Due today</span>
                      )}
                    </div>
                    
                    {overdue && (
                      <Badge variant="destructive" className="text-xs px-2 py-0.5">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Quick actions */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 hover:bg-white/60"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {reminders.length > 3 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:text-gray-800">
            View all {reminders.length} reminders
          </Button>
        </div>
      )}
    </div>
  );
};
