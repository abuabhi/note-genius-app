
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSmartSessionAnalytics } from '@/hooks/useSmartSessionAnalytics';
import { Brain, Clock, TrendingUp, Target, Coffee, Zap } from 'lucide-react';

export const SchedulingInsightsDashboard = () => {
  const { analytics, isLoading } = useSmartSessionAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            Complete more study sessions to see personalized insights
          </p>
        </CardContent>
      </Card>
    );
  }

  const bestHour = analytics.focusPatterns.bestHours[0];
  const worstHour = analytics.focusPatterns.worstHours[0];
  const avgAttentionSpan = analytics.focusPatterns.averageAttentionSpan;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Peak Performance Times */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4" />
            Peak Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {bestHour}:00
              </div>
              <p className="text-sm text-gray-600">Your best hour</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {analytics.focusPatterns.bestHours.slice(0, 3).map(hour => (
                <Badge key={hour} variant="secondary" className="text-xs">
                  {hour}:00
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {(analytics.timeSlotPerformance[bestHour] || 0).toFixed(1)}/5.0 avg rating
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attention Span */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Attention Span
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {avgAttentionSpan}min
              </div>
              <p className="text-sm text-gray-600">Average focus duration</p>
            </div>
            <div className="text-xs text-gray-500">
              {avgAttentionSpan >= 60 && "Excellent! Long sustained focus"}
              {avgAttentionSpan >= 30 && avgAttentionSpan < 60 && "Good focus duration"}
              {avgAttentionSpan < 30 && "Consider shorter, more frequent sessions"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((analytics.completionRates[bestHour] || 0) * 100)}%
              </div>
              <p className="text-sm text-gray-600">At peak hours</p>
            </div>
            <div className="text-xs text-gray-500">
              Schedule sessions during {bestHour}:00-{bestHour + 1}:00 for best results
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Difficulty */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Subject Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(analytics.subjectDifficulty)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([subject, difficulty]) => (
                <div key={subject} className="flex justify-between items-center text-sm">
                  <span className="truncate">{subject}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      difficulty > 3 ? 'text-red-600' : 
                      difficulty > 2 ? 'text-yellow-600' : 'text-green-600'
                    }`}
                  >
                    {difficulty > 3 ? 'Hard' : difficulty > 2 ? 'Medium' : 'Easy'}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Break Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Coffee className="h-4 w-4" />
            Break Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {analytics.breakEffectiveness.optimalBreakLength}min
              </div>
              <p className="text-sm text-gray-600">Optimal break length</p>
            </div>
            <p className="text-xs text-gray-500">
              Take breaks every {analytics.breakEffectiveness.sessionCountBeforeBreak} sessions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Low Performance Warning */}
      {worstHour && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4" />
              Avoid These Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {worstHour}:00
                </div>
                <p className="text-sm text-gray-600">Lowest performance</p>
              </div>
              <div className="text-xs text-gray-500">
                {(analytics.timeSlotPerformance[worstHour] || 0).toFixed(1)}/5.0 avg rating
              </div>
              <p className="text-xs text-amber-600">
                Consider light review or easier topics during this time
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
