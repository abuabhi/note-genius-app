
import React from 'react';
import { Check, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Todo, TodoStatus } from '@/hooks/useTodos';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onUpdate: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string | null) => string | null;
}

export const TodoList: React.FC<TodoListProps> = ({ 
  todos, 
  isLoading, 
  onUpdate, 
  onDelete,
  formatDate
}) => {
  // Helper function to check if a reminder is due/overdue
  const isReminderDue = (reminderTime: string | null) => {
    if (!reminderTime) return false;
    const now = new Date();
    const reminderDate = new Date(reminderTime);
    return reminderDate <= now;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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
      <div className="text-center py-10">
        <h3 className="text-2xl font-semibold text-gray-500 mb-2">No todos yet</h3>
        <p className="text-gray-400">Create a new todo to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => {
        const isDue = isReminderDue(todo.reminder_time);
        
        return (
          <Card 
            key={todo.id} 
            className={`${
              todo.status === 'completed' ? "opacity-70" : ""
            } ${
              isDue && todo.status !== 'completed' ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={todo.status === 'completed'}
                  onCheckedChange={(checked) => {
                    onUpdate(todo.id, checked ? 'completed' : 'pending');
                  }}
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${todo.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                      {todo.title}
                    </h3>
                    <div className="flex gap-1">
                      <Badge variant={
                        todo.priority === 'high' ? 'destructive' : 
                        todo.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {todo.priority}
                      </Badge>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => onDelete(todo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  
                  {todo.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {todo.description}
                    </p>
                  )}
                  
                  {todo.reminder_time && (
                    <div className={`flex items-center mt-2 text-xs ${
                      isDue && todo.status !== 'completed' ? 'text-orange-700' : 'text-gray-500'
                    }`}>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>Reminder: {formatDate(todo.reminder_time)}</span>
                      {isDue && todo.status !== 'completed' && (
                        <Badge variant="outline" className="ml-2 text-xs border-orange-300 text-orange-600 bg-orange-100">
                          Due
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
