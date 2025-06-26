
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { CheckSquare, Calendar, ArrowRight } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const LinkedTodosWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: linkedTodos = [] } = useQuery({
    queryKey: ['linked-todos', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get todos that might be linked to study sessions
      const { data: todos, error } = await supabase
        .from('reminders')
        .select('id, title, description, due_date, priority, status')
        .eq('user_id', user.id)
        .eq('type', 'todo')
        .in('status', ['pending', 'completed'])
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(4);

      if (error) throw error;

      // Check which todos have linked sessions
      const todosWithSessions = await Promise.all(
        (todos || []).map(async (todo) => {
          const { data: sessions, error: sessionsError } = await supabase
            .from('study_plan_sessions')
            .select('id, title, status, scheduled_date')
            .contains('completion_notes', `Linked to todo: ${todo.id}`)
            .order('scheduled_date', { ascending: false })
            .limit(1);

          if (sessionsError) {
            console.error('Error fetching linked sessions:', sessionsError);
            return { ...todo, linkedSession: null };
          }

          return {
            ...todo,
            linkedSession: sessions?.[0] || null,
          };
        })
      );

      return todosWithSessions.filter(todo => todo.linkedSession !== null);
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (linkedTodos.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckSquare className="h-4 w-4" />
          Linked Todos
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/todos')}
          className="text-xs"
        >
          View All
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {linkedTodos.map((todo) => (
          <div
            key={todo.id}
            className={`p-3 rounded-lg border ${
              todo.status === 'completed' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`font-medium text-sm ${
                  todo.status === 'completed' ? 'line-through text-gray-500' : ''
                }`}>
                  {todo.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getPriorityColor(todo.priority)} className="text-xs">
                    {todo.priority}
                  </Badge>
                  {todo.due_date && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDueDate(todo.due_date)}
                    </div>
                  )}
                  {todo.status === 'completed' && (
                    <Badge variant="outline" className="text-xs text-green-600">
                      ✓ Completed
                    </Badge>
                  )}
                </div>
                {todo.linkedSession && (
                  <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    📚 Linked to: {todo.linkedSession.title}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
