
import { ProgressCard } from "../shared/ProgressCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, Target, Calendar } from "lucide-react";
import { useAdaptiveLearning } from "@/hooks/progress/adaptive";

export const PerformanceForecastCard = () => {
  const { adaptiveLearningInsights, isLoading } = useAdaptiveLearning();

  if (isLoading) {
    return (
      <ProgressCard title="Performance Forecast" icon={TrendingUp}>
        <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { performanceForecast } = adaptiveLearningInsights;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-100';
      case 'declining': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  return (
    <ProgressCard title="Performance Forecast" icon={TrendingUp}>
      <div className="space-y-6">
        {/* Overall Trend */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-mint-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-800">30-Day Outlook</h3>
            <Badge className={getTrendColor(performanceForecast.overallTrend)}>
              {performanceForecast.overallTrend}
            </Badge>
          </div>
          <p className="text-sm text-blue-700">
            Based on your current study patterns, performance is trending{' '}
            <span className="font-medium">{performanceForecast.overallTrend}</span>
          </p>
        </div>

        {/* Subject Forecasts */}
        {performanceForecast.subjectForecasts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Subject Projections</h4>
            {performanceForecast.subjectForecasts.slice(0, 3).map((forecast, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{forecast.subject}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">{Math.round(forecast.currentMastery)}%</span>
                    <TrendingUp className="h-3 w-3 text-mint-600" />
                    <span className="font-medium text-mint-700">{Math.round(forecast.projectedMastery)}%</span>
                  </div>
                </div>
                <Progress 
                  value={forecast.projectedMastery} 
                  className="h-2 mb-2"
                />
                <div className="text-xs text-gray-500">
                  Confidence: {Math.round(forecast.confidenceInterval.lower)}% - {Math.round(forecast.confidenceInterval.upper)}%
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Risk Areas */}
        {performanceForecast.riskAreas.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Risk Areas
            </h4>
            {performanceForecast.riskAreas.slice(0, 2).map((risk, index) => (
              <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-orange-800">{risk.area}</span>
                  <Badge className={getRiskColor(risk.riskLevel)}>
                    {risk.riskLevel} risk
                  </Badge>
                </div>
                <p className="text-sm text-orange-700 mb-2">{risk.description}</p>
                <div className="text-xs text-orange-600">
                  <strong>Impact:</strong> {risk.impact}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Actions */}
        {performanceForecast.recommendedActions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <Target className="h-4 w-4 text-mint-600" />
              Recommended Actions
            </h4>
            {performanceForecast.recommendedActions.slice(0, 3).map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-mint-50 rounded-lg border border-mint-200">
                <Badge className={`text-xs ${getPriorityColor(action.priority)}`}>
                  {action.priority}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium text-mint-800">{action.action}</p>
                  <p className="text-xs text-mint-600 mt-1">{action.expectedImpact}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-3 w-3 text-mint-500" />
                    <span className="text-xs text-mint-600">{action.timeframe}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Exam Readiness */}
        {performanceForecast.examReadiness.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Exam Readiness</h4>
            <div className="space-y-2">
              {performanceForecast.examReadiness.slice(0, 2).map((readiness, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">{readiness.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-800">{readiness.readinessScore}%</span>
                    <span className="text-xs text-blue-600">
                      ({readiness.recommendedStudyHours}h needed)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProgressCard>
  );
};
