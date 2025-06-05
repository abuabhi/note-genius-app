
import React from "react";
import { CheckCircle, Clock, AlertTriangle, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Todo } from "@/hooks/todos/types";

interface TodoStatsProps {
  todos: Todo[];
}

export const TodoStats = ({ todos }: TodoStatsProps) => {
  const activeTodos = todos.filter(t => t.status !== 'completed').length;
  const completedTodos = todos.filter(t => t.status === 'completed').length;
  const overdueTodos = todos.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < new Date();
  }).length;
  const dueTodayTodos = todos.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    const today = new Date().toDateString();
    return new Date(t.due_date).toDateString() === today;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Active Todos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">{activeTodos}</div>
          <p className="text-xs text-blue-600">Tasks in progress</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800">{completedTodos}</div>
          <p className="text-xs text-green-600">Successfully finished</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            Due Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800">{dueTodayTodos}</div>
          <p className="text-xs text-orange-600">Need attention today</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-800">{overdueTodos}</div>
          <p className="text-xs text-red-600">Past due date</p>
        </CardContent>
      </Card>
    </div>
  );
};
