
import { ProgressCard } from "../shared/ProgressCard";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { useTimezoneAwareAnalytics } from "@/hooks/useTimezoneAwareAnalytics";

export const ConsistencyScore = () => {
  const { analytics, isLoading } = useTimezoneAwareAnalytics();

  if (isLoading) {
    return (
      <ProgressCard title="Study Consistency" icon={Target}>
        <div className="h-60 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  // Calculate real consistency score based on actual data
  const calculateConsistencyScore = () => {
    const weeklyMinutes = analytics.weeklyStudyTimeMinutes || 0;
    const previousWeekMinutes = analytics.previousWeekTimeMinutes || 0;
    const totalSessions = analytics.totalSessions || 0;
    
    // Base score calculation
    let score = 0;
    
    // Score based on weekly activity (0-40 points)
    if (weeklyMinutes > 0) {
      score += Math.min(40, (weeklyMinutes / 180) * 40); // 180 min = 3 hours target
    }
    
    // Score based on consistency (0-30 points)
    if (totalSessions > 1) {
      const avgSessionTime = weeklyMinutes / Math.max(analytics.weeklySessions, 1);
      if (avgSessionTime > 15 && avgSessionTime < 120) { // Good session length
        score += 30;
      } else if (avgSessionTime > 5) {
        score += 15;
      }
    }
    
    // Score based on improvement (0-30 points)
    if (previousWeekMinutes > 0 && weeklyMinutes >= previousWeekMinutes) {
      score += 30;
    } else if (weeklyMinutes > 0) {
      score += 15;
    }
    
    return Math.min(100, Math.round(score));
  };

  const consistencyScore = calculateConsistencyScore();
  const weeklyComparison = {
    thisWeek: Math.round((analytics.weeklyStudyTimeMinutes || 0) / 60 * 10) / 10,
    lastWeek: Math.round((analytics.previousWeekTimeMinutes || 0) / 60 * 10) / 10,
    percentageChange: analytics.weeklyChange || 0
  };

  // Calculate optimal study time based on actual patterns
  const calculateOptimalStudyTime = () => {
    const avgSessionTime = analytics.averageSessionTime || 0;
    const totalSessions = analytics.totalSessions || 0;
    
    if (totalSessions === 0) {
      return "Start studying to get personalized recommendations";
    }
    
    if (avgSessionTime < 20) {
      return "Try longer sessions (20-45 minutes) for better focus";
    } else if (avgSessionTime > 90) {
      return "Consider shorter sessions (45-60 minutes) to maintain concentration";
    } else if (avgSessionTime >= 25 && avgSessionTime <= 45) {
      return "Your current session length is optimal! Keep it up.";
    } else {
      return "Morning sessions (9-11 AM) tend to be most effective";
    }
  };

  const optimalStudyTime = calculateOptimalStudyTime();

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
            🎯 Personalized Recommendation
          </div>
          <div className="text-mint-700 text-sm">
            {optimalStudyTime}
          </div>
        </div>

        {/* Consistency Tips */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="font-semibold text-blue-800 mb-2">
            💡 Consistency Tips
          </div>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Study at the same time each day</li>
            <li>• Set realistic daily goals (20-45 minutes)</li>
            <li>• Take breaks every 25-30 minutes</li>
            <li>• Track your progress regularly</li>
          </ul>
        </div>
      </div>
    </ProgressCard>
  );
};
