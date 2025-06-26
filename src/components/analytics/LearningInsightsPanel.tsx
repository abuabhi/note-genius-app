
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLearningInsights } from '@/hooks/analytics/useLearningInsights';
import { Lightbulb, AlertTriangle, Trophy, Target, X, RefreshCw } from 'lucide-react';

export const LearningInsightsPanel: React.FC = () => {
  const { insights, generateInsights, dismissInsight, isGenerating, isLoading } = useLearningInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'recommendation': return <Target className="h-4 w-4 text-blue-500" />;
      default: return <Lightbulb className="h-4 w-4 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-50 border-yellow-200';
      case 'warning': return priority === 'high' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
      case 'recommendation': return 'bg-blue-50 border-blue-200';
      default: return 'bg-purple-50 border-purple-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const handleGenerateInsights = () => {
    generateInsights();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-500" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mt-1"></div>
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
            <Lightbulb className="h-5 w-5 text-purple-500" />
            Learning Insights
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateInsights}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No insights available yet</p>
            <Button 
              onClick={handleGenerateInsights} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.slice(0, 5).map((insight) => (
              <div 
                key={insight.id} 
                className={`border rounded-lg p-4 ${getInsightColor(insight.type, insight.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <Badge className={getPriorityBadge(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700">{insight.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                      {insight.actionable && (
                        <Badge variant="outline" className="text-xs">
                          Actionable
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissInsight(insight.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {insights.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                Showing 5 of {insights.length} insights
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
