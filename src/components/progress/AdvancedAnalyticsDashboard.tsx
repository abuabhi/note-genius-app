
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";
import { useTimezoneAwareAnalytics } from "@/hooks/useTimezoneAwareAnalytics";

export const AdvancedAnalyticsDashboard = () => {
  const { analytics, isLoading } = useTimezoneAwareAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate performance metrics based on real data
  const calculatePerformanceMetrics = () => {
    const totalMinutes = analytics.totalStudyTimeMinutes || 0;
    const totalSessions = analytics.totalSessions || 0;
    const cardsMastered = analytics.totalCardsMastered || 0;
    const accuracy = analytics.flashcardAccuracy || 0;

    // Performance score based on multiple factors
    let performanceScore = 0;
    
    // Study time factor (0-25 points)
    if (totalMinutes > 300) performanceScore += 25; // 5+ hours
    else if (totalMinutes > 120) performanceScore += 15; // 2+ hours
    else if (totalMinutes > 0) performanceScore += 5;

    // Session consistency (0-25 points)
    if (totalSessions > 10) performanceScore += 25;
    else if (totalSessions > 5) performanceScore += 15;
    else if (totalSessions > 0) performanceScore += 5;

    // Mastery progress (0-25 points)
    if (cardsMastered > 50) performanceScore += 25;
    else if (cardsMastered > 20) performanceScore += 15;
    else if (cardsMastered > 0) performanceScore += 5;

    // Accuracy (0-25 points)
    if (accuracy > 80) performanceScore += 25;
    else if (accuracy > 60) performanceScore += 15;
    else if (accuracy > 40) performanceScore += 10;
    else if (accuracy > 0) performanceScore += 5;

    return Math.min(100, performanceScore);
  };

  const performanceScore = calculatePerformanceMetrics();
  
  // Simulate comparative data (in real app, this would come from aggregated user data)
  const averageUserStudyTime = 180; // 3 hours average
  const averageUserAccuracy = 65; // 65% average accuracy
  const userStudyTime = analytics.weeklyStudyTimeMinutes || 0;
  const userAccuracy = analytics.flashcardAccuracy || 0;

  const studyTimeComparison = userStudyTime > 0 
    ? Math.round(((userStudyTime - averageUserStudyTime) / averageUserStudyTime) * 100)
    : 0;

  const accuracyComparison = userAccuracy > 0
    ? Math.round(((userAccuracy - averageUserAccuracy) / averageUserAccuracy) * 100)
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Performance Prediction Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <BarChart3 className="h-5 w-5" />
            Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {performanceScore}%
            </div>
            <div className="text-lg font-semibold text-purple-800">
              {performanceScore >= 80 ? 'Excellent' : 
               performanceScore >= 60 ? 'Good' : 
               performanceScore >= 40 ? 'Fair' : 'Needs Improvement'}
            </div>
            <Progress value={performanceScore} className="mt-3 h-3" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Study Time</span>
              <span className="text-sm font-medium">
                {Math.round((analytics.totalStudyTimeMinutes || 0) / 60 * 10) / 10}h total
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cards Mastered</span>
              <span className="text-sm font-medium">{analytics.totalCardsMastered || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Accuracy Rate</span>
              <span className="text-sm font-medium">{analytics.flashcardAccuracy || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Session Count</span>
              <span className="text-sm font-medium">{analytics.totalSessions || 0}</span>
            </div>
          </div>

          <div className="p-3 bg-purple-100 rounded-lg">
            <div className="text-purple-800 font-medium text-sm mb-1">
              {performanceScore >= 80 ? '🎉 Outstanding Performance!' :
               performanceScore >= 60 ? '👍 Good Progress!' :
               performanceScore >= 40 ? '📈 Keep Improving!' : '🚀 Ready to Start!'}
            </div>
            <div className="text-purple-700 text-xs">
              {performanceScore >= 80 ? 'You\'re in the top tier of learners!' :
               performanceScore >= 60 ? 'You\'re making solid progress.' :
               performanceScore >= 40 ? 'Focus on consistency to improve.' : 'Start with short, regular sessions.'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How You Compare Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Users className="h-5 w-5" />
            How You Compare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Weekly Study Time</span>
                <span className="text-sm font-medium">
                  vs. avg. {Math.round(averageUserStudyTime / 60 * 10) / 10}h
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((analytics.weeklyStudyTimeMinutes || 0) / 60 * 10) / 10}h
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  studyTimeComparison > 0 ? 'text-green-600' : 
                  studyTimeComparison < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <TrendingUp className={`h-4 w-4 ${
                    studyTimeComparison < 0 ? 'rotate-180' : ''
                  }`} />
                  {studyTimeComparison > 0 ? '+' : ''}{studyTimeComparison}%
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Accuracy Rate</span>
                <span className="text-sm font-medium">vs. avg. {averageUserAccuracy}%</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.flashcardAccuracy || 0}%
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  accuracyComparison > 0 ? 'text-green-600' : 
                  accuracyComparison < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <TrendingUp className={`h-4 w-4 ${
                    accuracyComparison < 0 ? 'rotate-180' : ''
                  }`} />
                  {accuracyComparison > 0 ? '+' : ''}{accuracyComparison}%
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Your Ranking</div>
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold text-blue-600">
                {performanceScore >= 80 ? 'Top 20%' :
                 performanceScore >= 60 ? 'Top 40%' :
                 performanceScore >= 40 ? 'Top 60%' : 'Building Up'}
              </div>
              <Target className="h-5 w-5 text-blue-500" />
            </div>
          </div>

          <div className="p-3 bg-blue-100 rounded-lg">
            <div className="text-blue-800 font-medium text-sm mb-1">
              💡 Insight
            </div>
            <div className="text-blue-700 text-xs">
              {studyTimeComparison > 20 ? 'You study more than most users!' :
               studyTimeComparison > 0 ? 'You\'re above average - keep it up!' :
               studyTimeComparison < -20 ? 'Try to increase your study time gradually.' :
               'You\'re getting started - consistency is key!'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
