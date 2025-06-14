
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Clock, MoreHorizontal } from 'lucide-react';
import { useOverdueTodoManager, OverdueTodo } from '@/hooks/useOverdueTodoManager';
import { OverdueTodoActionDialog } from './OverdueTodoActionDialog';
import { formatDistanceToNow, parseISO } from 'date-fns';

export const OverdueTodosSection: React.FC = () => {
  const { overdueItems, loading, actions } = useOverdueTodoManager();
  const [selectedTodo, setSelectedTodo] = useState<OverdueTodo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (loading) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">Loading overdue todos...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (overdueItems.length === 0) {
    return null; // Don't show section if no overdue todos
  }

  const handleTodoAction = (todo: OverdueTodo) => {
    setSelectedTodo(todo);
    setDialogOpen(true);
  };

  const gracePeriodTodos = overdueItems.filter(todo => todo.in_grace_period);
  const criticalTodos = overdueItems.filter(todo => !todo.in_grace_period);

  return (
    <>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Overdue Todos ({overdueItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {criticalTodos.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Critical (Past Grace Period)
              </h4>
              <div className="space-y-2">
                {criticalTodos.map((todo) => (
                  <div
                    key={todo.todo_id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-red-900">{todo.title}</div>
                      {todo.description && (
                        <div className="text-sm text-red-700 mt-1">{todo.description}</div>
                      )}
                      <div className="text-sm text-red-700">
                        Due {formatDistanceToNow(parseISO(todo.due_date), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {todo.days_overdue} days overdue
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTodoAction(todo)}
                        className="border-red-300 hover:bg-red-100"
                      >
                        Take Action
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gracePeriodTodos.length > 0 && (
            <div>
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                In Grace Period
              </h4>
              <div className="space-y-2">
                {gracePeriodTodos.map((todo) => (
                  <div
                    key={todo.todo_id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-amber-900">{todo.title}</div>
                      {todo.description && (
                        <div className="text-sm text-amber-700 mt-1">{todo.description}</div>
                      )}
                      <div className="text-sm text-amber-700">
                        Due {formatDistanceToNow(parseISO(todo.due_date), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {todo.days_overdue} days overdue
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTodoAction(todo)}
                        className="border-amber-300 hover:bg-amber-100"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <OverdueTodoActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        todo={selectedTodo}
        actions={actions}
      />
    </>
  );
};
