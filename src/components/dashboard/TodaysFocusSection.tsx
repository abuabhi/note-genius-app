
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Target, 
  CheckCircle, 
  Calendar,
  ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { TodaysFocusOverdueItems } from "./TodaysFocusOverdueItems";
import { TodaysFocusGoals } from "./TodaysFocusGoals";
import { TodaysFocusReminders } from "./TodaysFocusReminders";

export const TodaysFocusSection = () => {
  const { user } = useAuth();

  // Get today's due reminders and goals
  const { data: todaysItems = { reminders: [], goals: [], overdue: [] }, isLoading } = useQuery({
    queryKey: ['todays-focus', user?.id],
    queryFn: async () => {
      if (!user) return { reminders: [], goals: [], overdue: [] };

      const today = new Date().toISOString().split('T')[0];
      
      try {
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
      } catch (error) {
        console.error('Error fetching today\'s items:', error);
        return { reminders: [], goals: [], overdue: [] };
      }
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
        {/* Overdue Items */}
        <TodaysFocusOverdueItems overdueItems={todaysItems.overdue} />

        {/* Today's Goals */}
        <TodaysFocusGoals goals={todaysItems.goals} />

        {/* Today's Reminders */}
        <TodaysFocusReminders reminders={todaysItems.reminders} />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button asChild variant="outline">
            <Link to="/reminders">
              <Calendar className="h-4 w-4 mr-2" />
              View All Reminders
            </Link>
          </Button>
          <Button asChild variant="outline">
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
