
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, Clock, TrendingUp, BookOpen, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";

export const DashboardHeroSection = () => {
  const { todaysActivity, currentStreak, weeklyComparison, isLoading } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-mint-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-64 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-48"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weeklyGoal = 5; // hours - could be from user preferences
  const weeklyProgress = Math.min((weeklyComparison.thisWeek / weeklyGoal) * 100, 100);

  return (
    <Card className="bg-gradient-to-r from-mint-500 to-blue-600 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-black/10"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Welcome & Streak */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back to StudyBuddy!</h1>
              <p className="text-white/90">Let's continue your learning journey</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full">
                <Flame className="h-5 w-5 text-orange-300" />
                <span className="font-semibold">{currentStreak} day streak</span>
              </div>
              
              {weeklyComparison.trend === 'up' && (
                <Badge variant="secondary" className="bg-green-500 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{Math.round(((weeklyComparison.thisWeek - weeklyComparison.lastWeek) / weeklyComparison.lastWeek) * 100)}% this week
                </Badge>
              )}
            </div>
          </div>

          {/* Today's Progress */}
          <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="text-center bg-white/10 rounded-lg p-4">
              <Brain className="h-6 w-6 mx-auto mb-2 text-blue-200" />
              <div className="text-2xl font-bold">{todaysActivity.cardsReviewed}</div>
              <div className="text-sm text-white/80">Cards Today</div>
            </div>
            
            <div className="text-center bg-white/10 rounded-lg p-4">
              <Clock className="h-6 w-6 mx-auto mb-2 text-green-200" />
              <div className="text-2xl font-bold">{todaysActivity.studyTime}</div>
              <div className="text-sm text-white/80">Minutes Today</div>
            </div>
            
            <div className="text-center bg-white/10 rounded-lg p-4">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-200" />
              <div className="text-2xl font-bold">{todaysActivity.quizzesTaken}</div>
              <div className="text-sm text-white/80">Quizzes Today</div>
            </div>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Weekly Study Goal
            </span>
            <span>{weeklyComparison.thisWeek}h / {weeklyGoal}h</span>
          </div>
          <Progress value={weeklyProgress} className="h-2 bg-white/20" />
          <p className="text-xs text-white/80">
            {weeklyProgress >= 100 ? "🎉 Goal achieved!" : `${Math.round(weeklyGoal - weeklyComparison.thisWeek)}h left to reach your weekly goal`}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="secondary" size="sm" className="bg-white text-mint-600 hover:bg-white/90">
            <Link to="/flashcards">
              <BookOpen className="h-4 w-4 mr-2" />
              Study Flashcards
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
            <Link to="/quizzes">
              <Brain className="h-4 w-4 mr-2" />
              Take Quiz
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
            <Link to="/notes">
              <BookOpen className="h-4 w-4 mr-2" />
              View Notes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
