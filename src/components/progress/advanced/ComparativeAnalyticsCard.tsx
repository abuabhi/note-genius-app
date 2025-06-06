
import { ProgressCard } from "../shared/ProgressCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, Trophy, TrendingUp, BookOpen, Target, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdvancedAnalytics } from "@/hooks/progress/advanced";
import { useUnifiedStudyStats } from "@/hooks/useUnifiedStudyStats";

export const ComparativeAnalyticsCard = () => {
  const { advancedAnalytics, isLoading } = useAdvancedAnalytics();
  const { stats } = useUnifiedStudyStats();

  if (isLoading) {
    return (
      <ProgressCard title="Comparative Analytics" icon={Users}>
        <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { comparativeMetrics } = advancedAnalytics;
  
  // Check if user has any real study data
  const hasStudyData = stats.totalSessions > 0 || stats.totalSets > 0 || stats.studyTimeHours > 0;

  // Show empty state for new users
  if (!hasStudyData) {
    return (
      <ProgressCard title="How You Compare" icon={Users}>
        <div className="space-y-6">
          {/* Empty State for New Users */}
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">See How You Stack Up</h3>
            <p className="text-gray-600 mb-6">
              Start studying to see how your performance compares with other students.
            </p>
            
            {/* Study Action Buttons */}
            <div className="space-y-3">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/flashcards" className="flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Start Studying
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full border-blue-200 hover:bg-blue-50">
                <Link to="/quizzes" className="flex items-center justify-center gap-2">
                  <Target className="h-4 w-4" />
                  Take Assessment
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Preview Metrics (shown dimmed) */}
          <div className="space-y-4 opacity-40">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Performance Ranking
                </span>
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                  75th percentile
                </div>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-gray-600">
                Above average performance
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-800">You</div>
                <div className="text-sm text-gray-600">Your progress</div>
              </div>
              <div className="text-center p-3 bg-mint-50 rounded-lg">
                <div className="text-xl font-bold text-mint-800">12h</div>
                <div className="text-sm text-mint-600">Peer average</div>
              </div>
            </div>
          </div>

          {/* Fancy Notification */}
          <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Performance Insights
                </p>
                <p className="text-xs text-blue-700">
                  Comparisons become more meaningful as you build consistent study habits.
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full -mr-8 -mt-8 opacity-50"></div>
          </div>
        </div>
      </ProgressCard>
    );
  }

  // Helper functions for real data
  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return 'text-green-600 bg-green-100';
    if (percentile >= 60) return 'text-blue-600 bg-blue-100';
    if (percentile >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getStreakBadgeColor = (comparison: string) => {
    switch (comparison) {
      case 'above_average': return 'bg-green-100 text-green-800 border-green-200';
      case 'average': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getPercentileDescription = (percentile: number) => {
    if (percentile >= 90) return 'Top 10% of students';
    if (percentile >= 75) return 'Above average performance';
    if (percentile >= 50) return 'Average performance';
    if (percentile >= 25) return 'Below average performance';
    return 'Bottom 25% - room for growth';
  };

  // Show real data when available
  return (
    <ProgressCard title="How You Compare" icon={Users}>
      <div className="space-y-6">
        {/* Overall Performance Percentile */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Overall Performance
            </span>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPercentileColor(comparativeMetrics.performancePercentile)}`}>
              {comparativeMetrics.performancePercentile}th percentile
            </div>
          </div>
          <Progress 
            value={comparativeMetrics.performancePercentile} 
            className="h-2"
          />
          <p className="text-xs text-gray-600">
            {getPercentileDescription(comparativeMetrics.performancePercentile)}
          </p>
        </div>

        {/* Study Time Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-800">{Math.round(stats.studyTimeHours)}h</div>
            <div className="text-sm text-gray-600">Your total</div>
          </div>
          <div className="text-center p-3 bg-mint-50 rounded-lg">
            <div className="text-xl font-bold text-mint-800">
              {comparativeMetrics.averagePeerStudyTime}h
            </div>
            <div className="text-sm text-mint-600">Peer average</div>
          </div>
        </div>

        {/* Streak Comparison */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              Study Consistency
            </span>
          </div>
          <Badge className={getStreakBadgeColor(comparativeMetrics.streakComparison)}>
            {comparativeMetrics.streakComparison.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Subject Rankings */}
        {comparativeMetrics.subjectRankings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">
                Subject Rankings
              </span>
            </div>
            <div className="space-y-2">
              {comparativeMetrics.subjectRankings.slice(0, 3).map((ranking, index) => (
                <div key={ranking.subject} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {ranking.subject}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={ranking.percentile} 
                      className="h-1.5 w-16"
                    />
                    <span className="text-xs text-gray-500 w-8">
                      {ranking.percentile}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivation Message */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            {comparativeMetrics.performancePercentile >= 75 ? (
              <><strong>Excellent work!</strong> You're performing better than most students. Keep it up!</>
            ) : comparativeMetrics.performancePercentile >= 50 ? (
              <><strong>Good progress!</strong> You're on track. Small improvements can move you up significantly.</>
            ) : (
              <><strong>Great potential!</strong> Focus on consistency and you'll see rapid improvement.</>
            )}
          </p>
        </div>
      </div>
    </ProgressCard>
  );
};
