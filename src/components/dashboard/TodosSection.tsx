
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useSimplifiedTodos } from "@/hooks/useSimplifiedTodos";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isPast, parseISO } from "date-fns";

export const TodosSection = () => {
  const { todos, isLoading } = useSimplifiedTodos();

  // Filter for today's todos and upcoming todos
  const todaysTodos = todos.filter(todo => {
    if (todo.status === 'completed' || todo.status === 'cancelled') return false;
    
    if (!todo.due_date) return true; // Show todos without due dates
    
    const dueDate = parseISO(todo.due_date);
    return isToday(dueDate) || isPast(dueDate);
  }).slice(0, 3); // Show only top 3

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDueDate = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    
    const dueDate = parseISO(dueDateStr);
    if (isToday(dueDate)) return 'Due today';
    if (isPast(dueDate)) return 'Overdue';
    return `Due ${format(dueDate, 'MMM d')}`;
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            Today's Todos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="p-3 border border-gray-100 rounded-lg bg-white">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (todaysTodos.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            Today's Todos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto">
                <CheckSquare className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No todos for today</h3>
            <p className="text-gray-500 mb-4">
              Create your first todo to get started with task management.
            </p>
            <Button asChild className="bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700">
              <Link to="/todos">
                <Plus className="h-4 w-4 mr-2" />
                Create Todo
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg">
            <CheckSquare className="h-4 w-4 text-white" />
          </div>
          Today's Todos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todaysTodos.map(todo => {
          const dueInfo = formatDueDate(todo.due_date);
          const isOverdue = todo.due_date && isPast(parseISO(todo.due_date)) && !isToday(parseISO(todo.due_date));
          
          return (
            <div key={todo.id} className="p-4 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-800 line-clamp-1">{todo.title}</h4>
                  {todo.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{todo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPriorityColor(todo.priority)}`}
                  >
                    {todo.priority}
                  </Badge>
                </div>
              </div>
              
              {dueInfo && (
                <div className="flex items-center gap-2 mt-2">
                  {isOverdue ? (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  ) : (
                    <Clock className="h-3 w-3 text-mint-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    isOverdue ? 'text-red-600' : 'text-mint-600'
                  }`}>
                    {dueInfo}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        
        <div className="pt-3 border-t border-gray-100">
          <Button variant="ghost" size="sm" asChild className="w-full text-mint-600 hover:text-mint-700 hover:bg-mint-50">
            <Link to="/todos" className="text-sm font-medium">
              View All Todos
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
