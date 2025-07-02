
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { format, isToday, isPast } from "date-fns";

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: string;
  priority: string;
}

export const TodosSection = () => {
  const { user } = useAuth();

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['dashboard-todos', user?.id],
    queryFn: async (): Promise<TodoItem[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'todo')
        .in('status', ['pending', 'dismissed']) // Include dismissed since they should show as active todos
        .order('due_date', { ascending: true })
        .limit(4);

      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        due_date: item.due_date,
        status: item.status,
        priority: item.priority
      }));
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            Your Todos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const todayTodos = todos.filter(todo => todo.due_date && isToday(new Date(todo.due_date)));
  const overdueTodos = todos.filter(todo => todo.due_date && isPast(new Date(todo.due_date)) && !isToday(new Date(todo.due_date)));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            Your Todos
            {todos.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {todos.length} pending
              </Badge>
            )}
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link to="/todos">
              <Plus className="h-4 w-4 mr-1" />
              Add Todo
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {todos.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">No pending todos</h3>
            <p className="text-gray-500 text-sm mb-4">
              Add your first todo to stay organized
            </p>
            <Button asChild>
              <Link to="/todos">
                <CheckSquare className="h-4 w-4 mr-2" />
                Create First Todo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show overdue todos first */}
            {overdueTodos.map((todo) => (
              <div key={todo.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 mb-1">{todo.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      Overdue - {todo.due_date && format(new Date(todo.due_date), 'MMM d')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show today's todos */}
            {todayTodos.map((todo) => (
              <div key={todo.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-900 mb-1">{todo.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Clock className="h-3 w-3" />
                      Due today
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show other upcoming todos */}
            {todos.filter(todo => !todayTodos.includes(todo) && !overdueTodos.includes(todo)).slice(0, 2).map((todo) => (
              <div key={todo.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">{todo.title}</h4>
                    {todo.due_date && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Clock className="h-3 w-3" />
                        Due {format(new Date(todo.due_date), 'MMM d')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/todos">
                  View All Todos
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
