
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePredictiveLearning } from '@/hooks/analytics/usePredictiveLearning';
import { Brain, TrendingUp, Clock, Target, AlertTriangle, CheckCircle } from 'lucide-react';

export const PredictiveLearningDashboard: React.FC = () => {
  const { predictions, isLoading } = usePredictiveLearning();

  if (isLoading || !predictions) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getDifficultyColor = (progression: string) => {
    switch (progression) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'too_fast': return 'text-red-600 bg-red-100';
      case 'too_slow': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Learning Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {predictions.learningVelocity.toFixed(1)}
            </div>
            <p className="text-sm text-gray-600 mt-1">cards per hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Retention Probability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(predictions.retentionProbability * 100)}%
            </div>
            <Progress 
              value={predictions.retentionProbability * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getTrendIcon(predictions.performanceTrend)}
              <span className="text-lg font-semibold capitalize">
                {predictions.performanceTrend}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Difficulty Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getDifficultyColor(predictions.difficultyProgression)}>
              {predictions.difficultyProgression.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Weekly Goal Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Goal Achievement Likelihood</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(predictions.studyOutcomePrediction.weeklyGoalLikelihood * 100)}%
                  </span>
                </div>
                <Progress 
                  value={predictions.studyOutcomePrediction.weeklyGoalLikelihood * 100}
                  className="h-2"
                />
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Recommendation</p>
                <p className="text-sm text-gray-600">
                  {predictions.studyOutcomePrediction.weeklyGoalLikelihood > 0.8 
                    ? "You're on track to exceed your weekly goal! Great consistency."
                    : predictions.studyOutcomePrediction.weeklyGoalLikelihood > 0.6
                    ? "You're likely to meet your weekly goal with continued effort."
                    : "Consider increasing your study time to meet your weekly goal."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Optimal Study Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Based on your performance data:</p>
              <div className="grid grid-cols-1 gap-2">
                {predictions.studyOutcomePrediction.optimalStudyTimes.map((time, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm font-medium text-blue-900">{time}</span>
                    <Badge variant="secondary" className="text-xs">
                      Peak #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-1">Break Recommendation</p>
                <p className="text-sm text-yellow-700">
                  Take {predictions.studyOutcomePrediction.recommendedBreakFrequency}-minute breaks 
                  for optimal focus and retention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Predictive Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Learning Efficiency</h4>
                <p className="text-sm text-gray-600">
                  Your current learning velocity of {predictions.learningVelocity.toFixed(1)} cards/hour 
                  indicates {predictions.learningVelocity > 20 ? 'excellent' : predictions.learningVelocity > 10 ? 'good' : 'moderate'} 
                  progress. {predictions.difficultyProgression === 'optimal' 
                    ? 'Your difficulty progression is well-balanced.'
                    : predictions.difficultyProgression === 'too_fast'
                    ? 'Consider reviewing easier content to strengthen foundations.'
                    : 'You might benefit from more challenging material.'
                  }
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Retention Forecast</h4>
                <p className="text-sm text-gray-600">
                  With {Math.round(predictions.retentionProbability * 100)}% retention probability, 
                  your knowledge retention is {predictions.retentionProbability > 0.8 ? 'excellent' : 
                  predictions.retentionProbability > 0.6 ? 'good' : 'needs improvement'}. 
                  {predictions.retentionProbability < 0.7 && 
                    ' Consider reviewing content more frequently using spaced repetition.'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
