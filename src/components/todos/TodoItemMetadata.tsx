
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Repeat, Tag } from "lucide-react";
import { format } from "date-fns";
import { Todo } from "@/hooks/todos/types";

interface TodoItemMetadataProps {
  todo: Todo;
  formatDate: (dateString: string | null) => string | null;
  overdue: boolean;
}

export const TodoItemMetadata = ({ todo, formatDate, overdue }: TodoItemMetadataProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      {/* Due date */}
      {todo.due_date && (
        <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
          <Calendar className="h-3 w-3" />
          <span className={overdue ? 'text-red-600 font-medium' : ''}>
            {format(new Date(todo.due_date), 'MMM d')}
          </span>
        </div>
      )}

      {/* Reminder */}
      {todo.reminder_time && (
        <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
          <Clock className="h-3 w-3" />
          <span>{formatDate(todo.reminder_time)}</span>
        </div>
      )}

      {/* Priority badge */}
      <Badge className={`${getPriorityColor(todo.priority)} flex-shrink-0`}>
        {todo.priority}
      </Badge>

      {/* Additional metadata row */}
      {(todo.recurrence !== 'none' || (todo.auto_tags && todo.auto_tags.length > 0)) && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2 ml-8">
          {/* Recurrence */}
          {todo.recurrence && todo.recurrence !== 'none' && (
            <div className="flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              <span>{todo.recurrence}</span>
            </div>
          )}

          {/* Auto tags */}
          {todo.auto_tags && todo.auto_tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <div className="flex gap-1">
                {todo.auto_tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {todo.auto_tags.length > 2 && (
                  <span className="text-xs">+{todo.auto_tags.length - 2}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
