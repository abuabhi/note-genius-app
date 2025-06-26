
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRealTimeSessionTracker } from '@/hooks/useRealTimeSessionTracker';
import { usePredictiveLearning } from '@/hooks/usePredictiveLearning';
import { useAdaptiveSessionManager } from '@/hooks/useAdaptiveSessionManager';
import { Brain, Zap, TrendingUp, Target, Clock, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdaptiveLearningDashboard = () => {
  const { metrics, activities, isTracking } = useRealTimeSessionTracker();
  const { predictions, learningVelocity } = usePredictiveLearning();
  const { adaptations, getAdaptiveInsights } = useAdaptiveSessionManager();

  const insights = getAdaptiveInsights();

  // Transform activities for the performance graph
  const performanceData = activities
    .filter(a => a.activityType === 'answer_correct' || a.activityType === 'answer_incorrect')
    .slice(-20)
    .map((activity, index) => ({
      question: index + 1,
      accuracy: activity.activityType === 'answer_correct' ? 100 : 0,
      responseTime: activity.responseTime || 0,
    }));

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs_improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'accelerating': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!isTracking) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Adaptive Learning Dashboard
          </h3>
          <p className="text-gray-600">
            Start a study session to see real-time learning analytics and predictions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-blue-500" />
              Focus Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(metrics.focusLevel)}%
              </div>
              <Progress value={metrics.focusLevel} className="h-2" />
              <p className="text-xs text-gray-500">
                {metrics.focusLevel > 80 ? 'Excellent focus' : 
                 metrics.focusLevel > 60 ? 'Good focus' : 
                 metrics.focusLevel > 40 ? 'Moderate focus' : 'Low focus'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-green-500" />
              Accuracy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(metrics.accuracyRate)}%
              </div>
              <Progress value={metrics.accuracyRate} className="h-2" />
              <p className="text-xs text-gray-500">
                {activities.filter(a => a.activityType === 'answer_correct' || a.activityType === 'answer_incorrect').length} questions answered
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-purple-500" />
              Learning Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(learningVelocity.current)}
                </div>
                {getTrendIcon(learningVelocity.trend)}
              </div>
              <p className="text-xs text-gray-500">cards per hour</p>
              <Badge variant="outline" className="text-xs">
                {learningVelocity.trend}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-orange-500" />
              Session Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className={getQualityColor(metrics.sessionQuality)}>
                {metrics.sessionQuality.replace('_', ' ')}
              </Badge>
              <div className="text-sm text-gray-600">
                Engagement: {Math.round(metrics.engagementLevel)}%
              </div>
              <Progress value={metrics.engagementLevel} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Performance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Accuracy (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Answer some questions to see your performance trend
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictions and Insights */}
      {predictions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Mastery Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(predictions.topicMasteryETA).slice(0, 5).map(([topic, days]) => (
                <div key={topic} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{topic}</span>
                  <Badge variant="outline">
                    {days} day{days !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Adaptive Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Learning Efficiency:</span>
                  <span className="ml-2">{Math.round(insights.learningEfficiency * 100)}%</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Optimal Study Time:</span>
                  <span className="ml-2">{Math.round(insights.recommendedStudyTime)} minutes</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Current Difficulty:</span>
                  <span className="ml-2">{adaptations.difficultyLevel}/5</span>
                </div>
                {predictions.sessionSuccessProbability && (
                  <div className="text-sm">
                    <span className="font-medium">Success Probability:</span>
                    <span className="ml-2">{Math.round(predictions.sessionSuccessProbability * 100)}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Knowledge Gaps and Recommendations */}
      {predictions && predictions.knowledgeGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-red-500" />
              Knowledge Gaps & Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {predictions.knowledgeGaps.map((gap, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <span className="font-medium text-red-800">{gap}</span>
                    <p className="text-sm text-red-600">Needs focused review</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    Priority
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
