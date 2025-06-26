
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, CheckSquare, TrendingUp, Clock, BookOpen } from "lucide-react";
import { useTodaysFocusData } from "./hooks/useTodaysFocusData";
import { useNavigate } from "react-router-dom";
import { SessionGoalProgress } from "./SessionGoalProgress"; // New import
import { LinkedTodosWidget } from "./LinkedTodosWidget"; // New import

export const DashboardHeroSection = () => {
  const { userProfile } = useRequireAuth();
  const { todaysItems, isLoading, totalItems } = useTodaysFocusData();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatItemsText = (count: number, singular: string, plural: string) => {
    return `${count} ${count === 1 ? singular : plural}`;
  };

  return (
    <div className="space-y-6">
      {/* Main Hero Card */}
      <Card className="bg-gradient-to-r from-mint-500 to-mint-600 text-white border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  {getGreeting()}, {userProfile?.username || 'Scholar'}! 👋
                </h1>
                <p className="text-mint-100 text-lg">
                  Ready to tackle your learning goals today?
                </p>
              </div>
              
              {/* Today's Focus Summary */}
              <div className="flex flex-wrap gap-4">
                {totalItems > 0 ? (
                  <>
                    {todaysItems.reminders.length > 0 && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatItemsText(todaysItems.reminders.length, "reminder", "reminders")}
                      </Badge>
                    )}
                    {todaysItems.goals.length > 0 && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        <Target className="h-3 w-3 mr-1" />
                        {formatItemsText(todaysItems.goals.length, "active goal", "active goals")}
                      </Badge>
                    )}
                    {todaysItems.todos.length > 0 && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        <CheckSquare className="h-3 w-3 mr-1" />
                        {formatItemsText(todaysItems.todos.length, "todo", "todos")}
                      </Badge>
                    )}
                    {todaysItems.overdue.length > 0 && (
                      <Badge variant="destructive" className="bg-red-500/90 text-white">
                        ⚠️ {formatItemsText(todaysItems.overdue.length, "overdue item", "overdue items")}
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    All caught up! Great work! 🎉
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="secondary" 
                className="bg-white text-mint-600 hover:bg-mint-50 shadow-lg"
                onClick={() => navigate('/study-sessions')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Start Session
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate('/study-planner')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Study Planner
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionGoalProgress />
        <LinkedTodosWidget />
      </div>
    </div>
  );
};
