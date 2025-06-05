
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Brain, 
  Target, 
  Calendar,
  TrendingUp, 
  Award
} from "lucide-react";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";

export const LearningAnalyticsDashboard = () => {
  const { 
    totalSessions, 
    totalStudyTime, 
    totalCardsMastered, 
    flashcardAccuracy, 
    weeklyComparison,
    isLoading 
  } = useDashboardAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600 bg-green-50";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getTrendIndicator = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-mint-900">Learning Analytics</h2>
        
        {/* Primary Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Study Time */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Study Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalStudyTime}h</div>
              <div className="flex items-center mt-2 text-sm">
                {getTrendIndicator(weeklyComparison.trend)}
                <span className="ml-1 text-gray-600">
                  {weeklyComparison.thisWeek}h this week
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cards Mastered */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cards Mastered</CardTitle>
              <Brain className="h-4 w-4 text-mint-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalCardsMastered}</div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  High retention
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Flashcard Accuracy */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Accuracy Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{flashcardAccuracy}%</div>
              <div className="mt-2">
                <Badge className={getAccuracyColor(flashcardAccuracy)}>
                  {flashcardAccuracy >= 80 ? 'Excellent' : flashcardAccuracy >= 60 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Study Sessions */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalSessions}</div>
              <div className="text-sm text-gray-600 mt-2">
                Avg: {totalSessions > 0 ? Math.round(totalStudyTime / totalSessions * 60) : 0} min/session
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
