
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Target, TrendingUp, Calendar } from "lucide-react";
import { useProgressAnalytics } from "@/hooks/progress/useProgressAnalytics";
import { MetricDisplay } from "../shared/MetricDisplay";

export const ProgressOverviewCard = () => {
  const { overviewStats, studyTimeAnalytics, isLoading } = useProgressAnalytics();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-mint-100 to-blue-100 animate-pulse">
        <CardContent className="p-6">
          <div className="h-8 bg-mint-200/50 rounded w-64 mb-4"></div>
          <div className="h-4 bg-mint-200/50 rounded w-48"></div>
        </CardContent>
      </Card>
    );
  }

  const { weeklyComparison } = studyTimeAnalytics;
  const isWeeklyTrendPositive = weeklyComparison.percentageChange > 0;

  return (
    <Card className="bg-gradient-to-r from-mint-100 to-blue-100 text-mint-900 overflow-hidden relative border-mint-200">
      <div className="absolute inset-0 bg-white/20"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Welcome & Streak */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-mint-800">Your Learning Journey</h1>
              <p className="text-mint-700">Making great progress every day!</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-mint-200/50 px-4 py-2 rounded-full">
                <Flame className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-mint-800">
                  {overviewStats.currentStreak} day streak
                </span>
              </div>
              
              {isWeeklyTrendPositive && (
                <Badge variant="secondary" className="bg-green-600 text-white border-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{weeklyComparison.percentageChange}% this week
                </Badge>
              )}
            </div>
          </div>

          {/* Today's Progress Grid */}
          <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
            <MetricDisplay
              label="Cards Today"
              value={overviewStats.todaysCardsReviewed}
              color="blue"
              size="sm"
              className="text-center bg-white/60 rounded-lg p-4 border border-mint-200"
            />
            
            <MetricDisplay
              label="Minutes Today"
              value={overviewStats.todaysStudyTime}
              color="green"
              size="sm"
              className="text-center bg-white/60 rounded-lg p-4 border border-mint-200"
            />
            
            <MetricDisplay
              label="Quizzes Today"
              value={overviewStats.todaysQuizzes}
              color="mint"
              size="sm"
              className="text-center bg-white/60 rounded-lg p-4 border border-mint-200"
            />
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm text-mint-800">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Weekly Study Goal
            </span>
            <span>{overviewStats.weeklyStudyTime}h / 5h</span>
          </div>
          <Progress 
            value={overviewStats.weeklyGoalProgress} 
            className="h-2 bg-white/50"
          />
          <p className="text-xs text-mint-700">
            {overviewStats.weeklyGoalProgress >= 100 
              ? "🎉 Goal achieved! Keep up the excellent work!" 
              : `${Math.round(5 - (overviewStats.weeklyStudyTime / 60))}h left to reach your weekly goal`
            }
          </p>
        </div>

        {/* Achievement Badge */}
        {overviewStats.totalCardsMastered > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-mint-700">
            <Calendar className="h-4 w-4" />
            <span>🏆 {overviewStats.totalCardsMastered} cards mastered</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
