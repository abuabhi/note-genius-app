
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Todo, TodoStatus } from "@/hooks/todos/types";
import { Clock, CheckCircle, Circle, Trash2, Link, Calendar, Repeat, Tag, AlertTriangle, Edit } from "lucide-react";
import { format } from "date-fns";
import { CompleteConfirmationDialog } from "./CompleteConfirmationDialog";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onUpdate: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  formatDate: (dateString: string | null) => string | null;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading,
  onUpdate,
  onDelete,
  onEdit,
  formatDate
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    todoId: string;
    todoTitle: string;
  }>({
    open: false,
    todoId: "",
    todoTitle: ""
  });

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

  const isBlocked = (todo: Todo) => {
    if (!todo.depends_on_todo_id) return false;
    const dependency = todos.find(t => t.id === todo.depends_on_todo_id);
    return dependency && dependency.status !== 'completed';
  };

  const getDependencyTodo = (dependencyId: string) => {
    return todos.find(t => t.id === dependencyId);
  };

  const isOverdue = (todo: Todo) => {
    if (!todo.due_date || todo.status === 'completed') return false;
    return new Date(todo.due_date) < new Date();
  };

  const handleCheckboxChange = (todo: Todo, checked: boolean) => {
    if (checked && !isBlocked(todo)) {
      // Show confirmation dialog for completing todo
      setConfirmDialog({
        open: true,
        todoId: todo.id,
        todoTitle: todo.title
      });
    } else if (!checked) {
      // Directly mark as pending when unchecking
      onUpdate(todo.id, 'pending');
    }
  };

  const handleConfirmComplete = () => {
    if (confirmDialog.todoId) {
      onUpdate(confirmDialog.todoId, 'completed');
    }
    setConfirmDialog({ open: false, todoId: "", todoTitle: "" });
  };

  return (
    <>
      <div className="space-y-3">
        {todos.map((todo) => {
          const blocked = isBlocked(todo);
          const overdue = isOverdue(todo);
          const dependencyTodo = todo.depends_on_todo_id ? getDependencyTodo(todo.depends_on_todo_id) : null;
          
          return (
            <Card key={todo.id} className={`transition-all hover:shadow-md ${blocked ? 'opacity-60 border-orange-200' : ''} ${overdue ? 'border-red-200 bg-red-50' : ''}`}>
              <CardContent className="p-4">
                {/* Main todo row - everything in one line */}
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <Checkbox
                    checked={todo.status === 'completed'}
                    onCheckedChange={(checked) => handleCheckboxChange(todo, checked as boolean)}
                    disabled={blocked}
                    className="flex-shrink-0"
                  />
                  
                  {/* Title - takes up remaining space */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${todo.status === 'completed' ? 'line-through text-gray-500' : ''} ${overdue ? 'text-red-700' : ''}`}>
                      {todo.title}
                    </h3>
                  </div>

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

                  {/* Action buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(todo)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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

                {/* Description row (if exists) */}
                {todo.description && (
                  <div className="mt-2 ml-8">
                    <p className="text-sm text-gray-600">{todo.description}</p>
                  </div>
                )}

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

                {/* Dependency info */}
                {todo.depends_on_todo_id && dependencyTodo && (
                  <div className={`flex items-center gap-2 text-xs p-2 rounded mt-2 ${
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CompleteConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        onConfirm={handleConfirmComplete}
        todoTitle={confirmDialog.todoTitle}
      />
    </>
  );
};
