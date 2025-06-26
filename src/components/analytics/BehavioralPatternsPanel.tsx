
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBehavioralAnalysis } from '@/hooks/analytics/useBehavioralAnalysis';
import { Clock, Brain, Activity, Target, RefreshCw } from 'lucide-react';

export const BehavioralPatternsPanel: React.FC = () => {
  const { patterns, analyzePatterns, isAnalyzing, isLoading } = useBehavioralAnalysis();

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'study_time': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'break_frequency': return <Activity className="h-4 w-4 text-green-500" />;
      case 'learning_style': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'attention_span': return <Target className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatPatternType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.8) return 'bg-green-100 text-green-800';
    if (strength >= 0.6) return 'bg-blue-100 text-blue-800';
    if (strength >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleAnalyzePatterns = () => {
    analyzePatterns();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Behavioral Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Behavioral Patterns
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAnalyzePatterns}
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {patterns.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No patterns detected yet</p>
            <Button 
              onClick={handleAnalyzePatterns} 
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Analyze My Patterns
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {patterns.map((pattern) => (
              <div key={pattern.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPatternIcon(pattern.type)}
                    <h4 className="font-medium">{formatPatternType(pattern.type)}</h4>
                  </div>
                  <Badge className={getStrengthColor(pattern.strength)}>
                    {Math.round(pattern.strength * 100)}% confidence
                  </Badge>
                </div>

                {/* Pattern-specific details */}
                <div className="mb-4">
                  {pattern.type === 'study_time' && pattern.pattern.peakHours && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Peak study hours:</p>
                      <div className="flex flex-wrap gap-2">
                        {pattern.pattern.peakHours.map((hour: number) => (
                          <Badge key={hour} variant="outline">
                            {hour}:00 - {hour + 1}:00
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {pattern.type === 'break_frequency' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Average session: {Math.round(pattern.pattern.averageSessionDuration / 60)} minutes
                      </p>
                      <p className="text-sm text-gray-600">
                        Recommended break: {pattern.pattern.recommendedBreakInterval} minutes
                      </p>
                    </div>
                  )}

                  {pattern.type === 'learning_style' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Style: <span className="font-medium capitalize">
                          {pattern.pattern.style?.replace('_', ' ')}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Accuracy: {Math.round(pattern.pattern.averageAccuracy * 100)}% | 
                        Pace: {pattern.pattern.averagePace?.toFixed(1)} cards/min
                      </p>
                    </div>
                  )}

                  {pattern.type === 'attention_span' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Average attention span: {pattern.pattern.averageAttentionSpan} minutes
                      </p>
                      <p className="text-sm text-gray-600">
                        Based on {pattern.pattern.longSessionCount} extended sessions
                      </p>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {pattern.recommendations.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900 mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {pattern.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start gap-1">
                          <span className="text-blue-400 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={handleAnalyzePatterns}
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Re-analyze Patterns
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
