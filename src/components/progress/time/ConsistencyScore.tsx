
import { ProgressCard } from "../shared/ProgressCard";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { useProgressAnalytics } from "@/hooks/progress/useProgressAnalytics";

export const ConsistencyScore = () => {
  const { studyTimeAnalytics, isLoading } = useProgressAnalytics();

  if (isLoading) {
    return (
      <ProgressCard title="Study Consistency" icon={Target}>
        <div className="h-60 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { consistencyScore, weeklyComparison, optimalStudyTime } = studyTimeAnalytics;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const isWeeklyTrendPositive = weeklyComparison.percentageChange > 0;

  return (
    <ProgressCard title="Study Consistency Analysis" icon={Target}>
      <div className="space-y-6">
        {/* Consistency Score Display */}
        <div className="text-center space-y-4">
          <div className={`text-6xl font-bold ${getScoreColor(consistencyScore)}`}>
            {consistencyScore}
          </div>
          <div className="space-y-2">
            <div className="text-lg font-semibold text-gray-800">
              {getScoreLabel(consistencyScore)}
            </div>
            <Progress value={consistencyScore} className="h-3" />
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {weeklyComparison.thisWeek}h
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {weeklyComparison.lastWeek}h
            </div>
            <div className="text-sm text-gray-600">Last Week</div>
          </div>
        </div>

        {/* Weekly Trend */}
        {weeklyComparison.percentageChange !== 0 && (
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            isWeeklyTrendPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {isWeeklyTrendPositive ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            <span className="font-medium">
              {isWeeklyTrendPositive ? '+' : ''}{weeklyComparison.percentageChange}% vs last week
            </span>
          </div>
        )}

        {/* Optimal Study Time Recommendation */}
        <div className="p-4 bg-mint-50 rounded-lg">
          <div className="font-semibold text-mint-800 mb-2">
            🎯 Optimal Study Time
          </div>
          <div className="text-mint-700">
            Based on your performance data, you study most effectively during{' '}
            <strong>{optimalStudyTime}</strong>
          </div>
        </div>

        {/* Consistency Tips */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="font-semibold text-blue-800 mb-2">
            💡 Consistency Tips
          </div>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Study at the same time each day</li>
            <li>• Set realistic daily goals</li>
            <li>• Use short, focused sessions</li>
            <li>• Track your progress regularly</li>
          </ul>
        </div>
      </div>
    </ProgressCard>
  );
};
