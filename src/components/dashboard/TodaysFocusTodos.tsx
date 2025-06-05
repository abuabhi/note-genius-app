
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { formatDistanceToNow, parseISO, isToday } from 'date-fns';

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
}

interface TodaysFocusTodosProps {
  todos: TodoItem[];
}

export const TodaysFocusTodos = ({ todos }: TodaysFocusTodosProps) => {
  console.log('📝 TodaysFocusTodos component received todos:', todos);
  console.log('📝 Todos is array?:', Array.isArray(todos));
  console.log('📝 Todos length:', todos?.length);
  console.log('📝 Raw todos object:', JSON.stringify(todos, null, 2));
  
  if (!todos) {
    console.log('📝 Todos is null/undefined');
    return null;
  }

  if (!Array.isArray(todos)) {
    console.log('📝 Todos is not an array, type:', typeof todos);
    return null;
  }

  if (todos.length === 0) {
    console.log('📝 No todos to display (empty array)');
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 text-red-700';
      case 'medium':
        return 'border-yellow-300 text-yellow-700';
      case 'low':
        return 'border-green-300 text-green-700';
      default:
        return 'border-gray-300 text-gray-700';
    }
  };

  const isOverdue = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  console.log('📝 Rendering', todos.length, 'todos');
  console.log('📝 First todo details:', todos[0]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="font-medium text-gray-800">To-dos ({todos.length})</span>
      </div>
      <div className="space-y-2">
        {todos.slice(0, 3).map((todo) => {
          console.log('📝 Rendering individual todo:', todo);
          return (
            <div key={todo.id} className="flex items-center justify-between bg-green-50 rounded p-3">
              <div>
                <div className="font-medium text-green-800">{todo.title}</div>
                {todo.description && (
                  <div className="text-sm text-green-600">{todo.description}</div>
                )}
                <div className="text-xs text-green-500 mt-1">
                  {todo.due_date ? (
                    isOverdue(todo.due_date) ? (
                      <span className="text-red-600 font-medium">
                        Overdue by {formatDistanceToNow(parseISO(todo.due_date))}
                      </span>
                    ) : isToday(parseISO(todo.due_date)) ? (
                      'Due today'
                    ) : (
                      `Due ${formatDistanceToNow(parseISO(todo.due_date), { addSuffix: true })}`
                    )
                  ) : (
                    'No due date'
                  )}
                </div>
              </div>
              <Badge variant="outline" className={getPriorityColor(todo.priority || 'medium')}>
                {(todo.priority || 'medium')} priority
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};
