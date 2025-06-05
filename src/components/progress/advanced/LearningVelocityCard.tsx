import { ProgressCard } from "../shared/ProgressCard";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAdvancedAnalytics } from "@/hooks/progress/advanced";

export const LearningVelocityCard = () => {
  const { advancedAnalytics, isLoading } = useAdvancedAnalytics();

  if (isLoading) {
    return (
      <ProgressCard title="Learning Velocity" icon={Activity}>
        <div className="h-48 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { learningVelocityTrend, optimalStudyDuration } = advancedAnalytics;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'accelerating': return <TrendingUp className="h-5 w-5" />;
      case 'declining': return <TrendingDown className="h-5 w-5" />;
      default: return <Minus className="h-5 w-5" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'accelerating': return 'bg-green-100 text-green-800 border-green-200';
      case 'declining': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTrendMessage = (trend: string) => {
    switch (trend) {
      case 'accelerating': 
        return 'Your learning pace is increasing! You\'re building great momentum.';
      case 'declining': 
        return 'Your pace has slowed recently. Consider adjusting your study routine.';
      default: 
        return 'You\'re maintaining a steady learning pace. Consistency is key!';
    }
  };

  const getOptimalDurationMessage = (duration: number) => {
    if (duration <= 20) return 'Short, focused sessions work best for you';
    if (duration <= 40) return 'Moderate session length is your sweet spot';
    return 'You thrive with longer, deep-focus sessions';
  };

  return (
    <ProgressCard title="Learning Velocity Analysis" icon={Activity}>
      <div className="space-y-6">
        {/* Current Trend */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Current Learning Trend
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={getTrendColor(learningVelocityTrend)}>
              <div className="flex items-center gap-1">
                {getTrendIcon(learningVelocityTrend)}
                {learningVelocityTrend.toUpperCase()}
              </div>
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600">
            {getTrendMessage(learningVelocityTrend)}
          </p>
        </div>

        {/* Optimal Study Duration */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Your Optimal Session Length
            </span>
          </div>
          
          <div className="text-center p-4 bg-mint-50 rounded-lg border border-mint-200">
            <div className="text-3xl font-bold text-mint-800 mb-1">
              {optimalStudyDuration} min
            </div>
            <div className="text-sm text-mint-600">
              {getOptimalDurationMessage(optimalStudyDuration)}
            </div>
          </div>
        </div>

        {/* Velocity Insights */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-gray-700">
            Velocity Insights
          </span>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">
                {learningVelocityTrend === 'accelerating' ? '↗' : 
                 learningVelocityTrend === 'declining' ? '↘' : '→'}
              </div>
              <div className="text-xs text-gray-600">Trend Direction</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-800">
                {optimalStudyDuration > 30 ? 'Deep' : 'Quick'}
              </div>
              <div className="text-xs text-gray-600">Learning Style</div>
            </div>
          </div>
        </div>

        {/* Actionable Tip */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> {
              learningVelocityTrend === 'accelerating' ? 
                'You\'re on fire! Consider gradually increasing study complexity.' :
              learningVelocityTrend === 'declining' ?
                'Try mixing up your study methods or taking short breaks between sessions.' :
                'Perfect pace! Maintain this rhythm and consider setting new challenge goals.'
            }
          </p>
        </div>
      </div>
    </ProgressCard>
  );
};
