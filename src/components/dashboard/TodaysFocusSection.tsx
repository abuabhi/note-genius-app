
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Clock, 
  Bell, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { formatDistanceToNow, isToday, parseISO } from 'date-fns';

export const TodaysFocusSection = () => {
  const { user } = useAuth();

  // Get today's due reminders and goals
  const { data: todaysItems = { reminders: [], goals: [], overdue: [] }, isLoading } = useQuery({
    queryKey: ['todays-focus', user?.id],
    queryFn: async () => {
      if (!user) return { reminders: [], goals: [], overdue: [] };

      const today = new Date().toISOString().split('T')[0];
      
      // Get due reminders
      const { data: reminders } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .or(`due_date.eq.${today},reminder_time.gte.${today}T00:00:00,reminder_time.lte.${today}T23:59:59`)
        .order('reminder_time', { ascending: true })
        .limit(5);

      // Get active goals that should be worked on today
      const { data: goals } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('end_date', { ascending: true })
        .limit(3);

      // Get overdue items
      const { data: overdue } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lt('due_date', today)
        .order('due_date', { ascending: true })
        .limit(3);

      return {
        reminders: reminders || [],
        goals: goals || [],
        overdue: overdue || []
      };
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

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

  const totalItems = todaysItems.reminders.length + todaysItems.goals.length + todaysItems.overdue.length;

  if (totalItems === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">All caught up!</h3>
          <p className="text-green-600 mb-4">No due items for today. Great job staying on top of things!</p>
          <Button asChild variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
            <Link to="/flashcards">
              Continue Studying
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
          <Target className="h-5 w-5 text-orange-600" />
          Today's Focus
          {todaysItems.overdue.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {todaysItems.overdue.length} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue Items - High Priority */}
        {todaysItems.overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Overdue Items</span>
            </div>
            <div className="space-y-2">
              {todaysItems.overdue.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between bg-white rounded p-2">
                  <div>
                    <div className="font-medium text-red-800">{item.title}</div>
                    <div className="text-xs text-red-600">
                      Due {formatDistanceToNow(parseISO(item.due_date), { addSuffix: true })}
                    </div>
                  </div>
                  <Badge variant="destructive" size="sm">Overdue</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Goals */}
        {todaysItems.goals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-800">Active Goals</span>
            </div>
            <div className="space-y-2">
              {todaysItems.goals.map((goal: any) => (
                <div key={goal.id} className="flex items-center justify-between bg-blue-50 rounded p-3">
                  <div>
                    <div className="font-medium text-blue-800">{goal.title}</div>
                    <div className="text-sm text-blue-600">{goal.description}</div>
                    <div className="text-xs text-blue-500 mt-1">
                      Target: {goal.target_hours}h | Progress: {goal.progress}%
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      {goal.target_hours}h goal
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Reminders */}
        {todaysItems.reminders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-gray-800">Due Today</span>
            </div>
            <div className="space-y-2">
              {todaysItems.reminders.slice(0, 3).map((reminder: any) => (
                <div key={reminder.id} className="flex items-center justify-between bg-purple-50 rounded p-3">
                  <div>
                    <div className="font-medium text-purple-800">{reminder.title}</div>
                    {reminder.description && (
                      <div className="text-sm text-purple-600">{reminder.description}</div>
                    )}
                    <div className="text-xs text-purple-500 mt-1">
                      {reminder.reminder_time ? (
                        `Due at ${new Date(reminder.reminder_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      ) : (
                        'Due today'
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="border-purple-300 text-purple-700">
                    {reminder.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button asChild variant="outline" size="sm">
            <Link to="/reminders">
              <Calendar className="h-4 w-4 mr-2" />
              View All Reminders
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/goals">
              <Target className="h-4 w-4 mr-2" />
              Manage Goals
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
