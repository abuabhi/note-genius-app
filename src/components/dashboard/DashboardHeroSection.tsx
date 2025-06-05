
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Clock, TrendingUp, BookOpen, Brain, CheckSquare, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useNavigationFeatures } from "@/components/ui/sidebar/hooks/useNavigationFeatures";

export const DashboardHeroSection = () => {
  const { todaysActivity, currentStreak, weeklyComparison, isLoading } = useDashboardAnalytics();
  const { user } = useAuth();
  const {
    isGoalsVisible,
    isTodosVisible,
    isProgressVisible,
  } = useNavigationFeatures();

  // Get counts for dynamic button text
  const { data: counts = { flashcardSets: 0, notes: 0, quizzes: 0, goals: 0, todos: 0 } } = useQuery({
    queryKey: ['dashboard-action-counts', user?.id],
    queryFn: async () => {
      if (!user) return { flashcardSets: 0, notes: 0, quizzes: 0, goals: 0, todos: 0 };

      const [flashcardSets, notes, quizzes, goals, todos] = await Promise.all([
        supabase.from('flashcard_sets').select('id').eq('user_id', user.id),
        supabase.from('notes').select('id').eq('user_id', user.id),
        supabase.from('quizzes').select('id').eq('user_id', user.id),
        supabase.from('study_goals').select('id').eq('user_id', user.id),
        supabase.from('reminders').select('id').eq('user_id', user.id).eq('type', 'todo')
      ]);

      return {
        flashcardSets: flashcardSets.data?.length || 0,
        notes: notes.data?.length || 0,
        quizzes: quizzes.data?.length || 0,
        goals: goals.data?.length || 0,
        todos: todos.data?.length || 0
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-mint-100 to-blue-100 text-mint-900">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-mint-200/50 rounded w-64 mb-4"></div>
            <div className="h-4 bg-mint-200/50 rounded w-48"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weeklyGoal = 5; // hours - could be from user preferences
  const weeklyProgress = Math.min((weeklyComparison.thisWeek / weeklyGoal) * 100, 100);

  return (
    <Card className="bg-gradient-to-r from-mint-100 to-blue-100 text-mint-900 overflow-hidden relative border-mint-200">
      <div className="absolute inset-0 bg-white/20"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Welcome & Streak */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-mint-800">Welcome back to StudyBuddy!</h1>
              <p className="text-mint-700">Let's continue your learning journey</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-mint-200/50 px-3 py-2 rounded-full">
                <Flame className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-mint-800">{currentStreak} day streak</span>
              </div>
              
              {weeklyComparison.trend === 'up' && (
                <Badge variant="secondary" className="bg-green-600 text-white border-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{Math.round(((weeklyComparison.thisWeek - weeklyComparison.lastWeek) / weeklyComparison.lastWeek) * 100)}% this week
                </Badge>
              )}
            </div>
          </div>

          {/* Today's Progress */}
          <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="text-center bg-white/60 rounded-lg p-4 border border-mint-200">
              <Brain className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-mint-800">{todaysActivity.cardsReviewed}</div>
              <div className="text-sm text-mint-700">Cards Today</div>
            </div>
            
            <div className="text-center bg-white/60 rounded-lg p-4 border border-mint-200">
              <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-mint-800">{todaysActivity.studyTime}</div>
              <div className="text-sm text-mint-700">Minutes Today</div>
            </div>
            
            <div className="text-center bg-white/60 rounded-lg p-4 border border-mint-200">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-mint-800">{todaysActivity.quizzesTaken}</div>
              <div className="text-sm text-mint-700">Quizzes Today</div>
            </div>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm text-mint-800">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Weekly Study Goal
            </span>
            <span>{weeklyComparison.thisWeek}h / {weeklyGoal}h</span>
          </div>
          <Progress value={weeklyProgress} className="h-2 bg-white/50" />
          <p className="text-xs text-mint-700">
            {weeklyProgress >= 100 ? "🎉 Goal achieved!" : `${Math.round(weeklyGoal - weeklyComparison.thisWeek)}h left to reach your weekly goal`}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="default" size="sm" className="bg-mint-600 text-white hover:bg-mint-700">
            <Link to="/flashcards">
              <BookOpen className="h-4 w-4 mr-2" />
              {counts.flashcardSets > 0 ? "Study Flashcards" : "Add Flashcards"}
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="border-mint-600 text-mint-700 bg-white hover:bg-mint-50">
            <Link to="/quizzes">
              <Brain className="h-4 w-4 mr-2" />
              {counts.quizzes > 0 ? "Take Quiz" : "Add Quiz"}
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="border-mint-600 text-mint-700 bg-white hover:bg-mint-50">
            <Link to="/notes">
              <BookOpen className="h-4 w-4 mr-2" />
              {counts.notes > 0 ? "View Notes" : "Add Notes"}
            </Link>
          </Button>

          {isGoalsVisible && (
            <Button asChild variant="outline" size="sm" className="border-mint-600 text-mint-700 bg-white hover:bg-mint-50">
              <Link to="/goals">
                <Target className="h-4 w-4 mr-2" />
                {counts.goals > 0 ? "View Goals" : "Add Goals"}
              </Link>
            </Button>
          )}

          {isTodosVisible && (
            <Button asChild variant="outline" size="sm" className="border-mint-600 text-mint-700 bg-white hover:bg-mint-50">
              <Link to="/todos">
                <CheckSquare className="h-4 w-4 mr-2" />
                {counts.todos > 0 ? "View ToDo's" : "Add ToDo's"}
              </Link>
            </Button>
          )}

          {isProgressVisible && (
            <Button asChild variant="outline" size="sm" className="border-mint-600 text-mint-700 bg-white hover:bg-mint-50">
              <Link to="/progress">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Progress
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
