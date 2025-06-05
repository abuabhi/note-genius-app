import { ProgressCard } from "../shared/ProgressCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertTriangle, Clock, Target } from "lucide-react";
import { useAdvancedAnalytics } from "@/hooks/progress/advanced";

export const PerformancePredictionCard = () => {
  const { advancedAnalytics, isLoading } = useAdvancedAnalytics();

  if (isLoading) {
    return (
      <ProgressCard title="Performance Predictions" icon={TrendingUp}>
        <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { performancePrediction } = advancedAnalytics;

  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getDifficultyColor = (progression: string) => {
    switch (progression) {
      case 'too_hard': return 'text-red-600';
      case 'too_easy': return 'text-blue-600';
      default: return 'text-green-600';
    }
  };

  return (
    <ProgressCard title="AI Performance Predictions" icon={TrendingUp}>
      <div className="space-y-6">
        {/* Weekly Goal Likelihood */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Weekly Goal Achievement
            </span>
            <span className="text-lg font-bold text-mint-600">
              {Math.round(performancePrediction.weeklyGoalLikelihood)}%
            </span>
          </div>
          <Progress 
            value={performancePrediction.weeklyGoalLikelihood} 
            className="h-2"
          />
          <p className="text-xs text-gray-500">
            Likelihood of meeting your 5-hour weekly study goal
          </p>
        </div>

        {/* Optimal Study Times */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Your Peak Performance Times
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {performancePrediction.optimalStudyTimes.map((time, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                {time}
              </Badge>
            ))}
          </div>
        </div>

        {/* Burnout Risk Assessment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">
              Burnout Risk Assessment
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Badge className={getBurnoutColor(performancePrediction.burnoutRisk)}>
              {performancePrediction.burnoutRisk.toUpperCase()} RISK
            </Badge>
            <span className="text-sm text-gray-600">
              Break every {performancePrediction.recommendedBreakFrequency} min
            </span>
          </div>
        </div>

        {/* Difficulty Progression */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              Learning Difficulty
            </span>
          </div>
          <div className={`text-sm font-medium ${getDifficultyColor(performancePrediction.difficultyProgression)}`}>
            {performancePrediction.difficultyProgression === 'optimal' && '✓ Optimal Challenge Level'}
            {performancePrediction.difficultyProgression === 'too_easy' && '⬆ Consider Harder Material'}
            {performancePrediction.difficultyProgression === 'too_hard' && '⬇ Try Easier Material First'}
          </div>
        </div>

        {/* AI Insights Summary */}
        <div className="p-3 bg-mint-50 rounded-lg border border-mint-200">
          <p className="text-sm text-mint-800">
            <strong>AI Insight:</strong> Based on your study patterns, you perform best during{' '}
            {performancePrediction.optimalStudyTimes[0] || 'morning hours'} with{' '}
            {performancePrediction.recommendedBreakFrequency}-minute focused sessions.
          </p>
        </div>
      </div>
    </ProgressCard>
  );
};
