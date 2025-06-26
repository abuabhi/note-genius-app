
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedAnalytics } from '@/hooks/analytics/useAdvancedAnalytics';
import { PredictiveLearningDashboard } from './PredictiveLearningDashboard';
import { AdvancedPerformanceMetrics } from './AdvancedPerformanceMetrics';
import { BehavioralPatternsPanel } from './BehavioralPatternsPanel';
import { LearningInsightsPanel } from './LearningInsightsPanel';
import { ComparativeBenchmarkChart } from './ComparativeBenchmarkChart';
import { Brain, BarChart3, TrendingUp, Lightbulb, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const {
    data,
    refreshAllAnalytics,
    isLoading,
    isCalculating,
    isAnalyzing,
    isGenerating
  } = useAdvancedAnalytics();

  useEffect(() => {
    // Auto-refresh analytics on component mount if no data
    if (!data && !isLoading) {
      refreshAllAnalytics().catch(() => {
        toast.error('Failed to load analytics data');
      });
    }
  }, [data, isLoading, refreshAllAnalytics]);

  const handleRefresh = async () => {
    try {
      await refreshAllAnalytics();
      toast.success('Analytics refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh analytics');
    }
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Learning Analytics</h2>
            <p className="text-gray-600">AI-powered insights into your learning patterns and performance</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Learning Analytics</h2>
          <p className="text-gray-600">AI-powered insights into your learning patterns and performance</p>
        </div>
        
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </Button>
      </div>

      {data && (
        <div className="text-sm text-gray-500 mb-4">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LearningInsightsPanel />
            <ComparativeBenchmarkChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BehavioralPatternsPanel />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Learning Velocity</p>
                      <p className="text-lg text-blue-700">{data.predictiveLearning.learningVelocity.toFixed(1)} cards/hour</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900">Retention Probability</p>
                      <p className="text-lg text-green-700">{Math.round(data.predictiveLearning.retentionProbability * 100)}%</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-900">Performance Trend</p>
                      <p className="text-lg text-purple-700 capitalize">{data.predictiveLearning.performanceTrend}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading insights...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveLearningDashboard />
        </TabsContent>

        <TabsContent value="performance">
          <AdvancedPerformanceMetrics />
        </TabsContent>

        <TabsContent value="patterns">
          <BehavioralPatternsPanel />
        </TabsContent>

        <TabsContent value="compare">
          <ComparativeBenchmarkChart />
        </TabsContent>
      </Tabs>

      {(isCalculating || isAnalyzing || isGenerating) && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <span className="text-blue-700">
            {isCalculating && 'Calculating predictions...'}
            {isAnalyzing && 'Analyzing behavioral patterns...'}
            {isGenerating && 'Generating insights...'}
          </span>
        </div>
      )}
    </div>
  );
};
