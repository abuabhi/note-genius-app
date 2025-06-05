
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Todo, TodoStatus } from "@/hooks/todos/types";
import { Clock, CheckCircle, Circle, Trash2, Link, Calendar, Repeat, Tag, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onUpdate: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  formatDate: (dateString: string | null) => string | null;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading,
  onUpdate,
  onDelete,
  formatDate
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Circle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No todos found</h3>
          <p className="text-gray-500">Create your first todo to get started!</p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TodoStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getNextStatus = (currentStatus: TodoStatus): TodoStatus => {
    switch (currentStatus) {
      case 'new': return 'pending';
      case 'pending': return 'completed';
      case 'completed': return 'new';
      default: return 'pending';
    }
  };

  const isBlocked = (todo: Todo) => {
    if (!todo.depends_on_todo_id) return false;
    const dependency = todos.find(t => t.id === todo.depends_on_todo_id);
    return dependency && dependency.status !== 'completed';
  };

  const getDependencyTodo = (dependencyId: string) => {
    return todos.find(t => t.id === dependencyId);
  };

  return (
    <div className="space-y-4">
      {todos.map((todo) => {
        const blocked = isBlocked(todo);
        const dependencyTodo = todo.depends_on_todo_id ? getDependencyTodo(todo.depends_on_todo_id) : null;
        
        return (
          <Card key={todo.id} className={`transition-all hover:shadow-md ${blocked ? 'opacity-60 border-orange-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Header with title and status */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => !blocked && onUpdate(todo.id, getNextStatus(todo.status))}
                      disabled={blocked}
                      className="flex-shrink-0"
                    >
                      {getStatusIcon(todo.status)}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${todo.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                      )}
                    </div>

                    <Badge className={getPriorityColor(todo.priority)}>
                      {todo.priority}
                    </Badge>
                  </div>

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {/* Due date */}
                    {todo.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {format(new Date(todo.due_date), 'MMM d')}</span>
                      </div>
                    )}

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

                    {/* Reminder time */}
                    {todo.reminder_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Remind: {formatDate(todo.reminder_time)}</span>
                      </div>
                    )}
                  </div>

                  {/* Dependency info */}
                  {todo.depends_on_todo_id && dependencyTodo && (
                    <div className={`flex items-center gap-2 text-xs p-2 rounded ${
                      blocked ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {blocked ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <Link className="h-3 w-3" />
                      )}
                      <span>
                        {blocked ? 'Blocked by:' : 'Depends on:'} "{dependencyTodo.title}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(todo.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
