
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useTodos } from "@/hooks/useTodos";
import { formatDistanceToNow, parseISO, isToday, isPast } from 'date-fns';

export const TodosSection = () => {
  console.log('📋 TodosSection rendering');
  
  const { todos, isLoading } = useTodos();
  
  // Filter for today's and overdue todos
  const todaysTodos = todos.filter(todo => {
    if (todo.status === 'completed') return false;
    if (!todo.due_date) return false;
    
    const dueDate = parseISO(todo.due_date);
    return isToday(dueDate) || isPast(dueDate);
  });

  const sortedTodos = todaysTodos
    .sort((a, b) => {
      // Sort by due date, then by priority
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      
      const dateA = parseISO(a.due_date);
      const dateB = parseISO(b.due_date);
      const dateComparison = dateA.getTime() - dateB.getTime();
      
      if (dateComparison !== 0) return dateComparison;
      
      // Priority order: high -> medium -> low
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5); // Show only first 5 todos

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    const due = parseISO(dueDate);
    return isPast(due) && !isToday(due);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedTodos.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Today's Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">All caught up!</h3>
          <p className="text-green-600 mb-4">No tasks due today. Great job staying organized!</p>
          <Button asChild className="text-white">
            <Link to="/todos">
              View All Tasks
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Today's Tasks
          {sortedTodos.some(todo => todo.due_date && isOverdue(todo.due_date)) && (
            <Badge variant="destructive" className="ml-2">
              {sortedTodos.filter(todo => todo.due_date && isOverdue(todo.due_date)).length} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {sortedTodos.map((todo) => (
            <div 
              key={todo.id} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                todo.due_date && isOverdue(todo.due_date) 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-gray-900">{todo.title}</div>
                  {todo.due_date && isOverdue(todo.due_date) && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                {todo.description && (
                  <div className="text-sm text-gray-600 mt-1">{todo.description}</div>
                )}
                {todo.due_date && (
                  <div className={`text-xs mt-1 ${
                    isOverdue(todo.due_date) ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    Due {formatDistanceToNow(parseISO(todo.due_date), { addSuffix: true })}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getPriorityColor(todo.priority)}>
                  {todo.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button asChild className="w-full text-white">
            <Link to="/todos">
              <Calendar className="h-4 w-4 mr-2" />
              View All Tasks
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
