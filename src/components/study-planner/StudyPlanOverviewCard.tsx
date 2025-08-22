import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, TrendingUp, Target, Plus } from 'lucide-react';
import { useUnifiedAnalytics } from '@/hooks/useUnifiedAnalytics';
import { ManualStudyTimeForm } from './ManualStudyTimeForm';

interface StudyPlanOverviewCardProps {
  activePlansCount: number;
}

export const StudyPlanOverviewCard: React.FC<StudyPlanOverviewCardProps> = ({ activePlansCount }) => {
  const { analytics, isLoading } = useUnifiedAnalytics();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Study Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-mint-600" />
          Study Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Study Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">Online Study</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatTime(analytics.totalStudyTimeMinutes || 0)}
            </p>
            <p className="text-xs text-green-700 mt-1">Online (placeholder)</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">Offline Study</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              0m
            </p>
            <p className="text-xs text-blue-700 mt-1">Manual entries</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <Target className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{activePlansCount}</p>
            <p className="text-xs text-gray-600">Active Plans</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
              <Calendar className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">{analytics.totalSessions}</p>
            <p className="text-xs text-gray-600">Total Sessions</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-mint-600 mb-1">
              <Clock className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatTime(analytics.totalStudyTimeMinutes)}
            </p>
            <p className="text-xs text-gray-600">Total Time</p>
          </div>
        </div>

        {/* Add Manual Study Time */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Track Offline Study</h3>
              <p className="text-xs text-gray-600">Add study time from outside the app</p>
            </div>
            <ManualStudyTimeForm 
              trigger={
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Offline Time
                </Button>
              }
            />
          </div>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
            <strong>Tip:</strong> Add study sessions you completed outside the app (textbooks, handwritten notes, etc.) 
            to get a complete picture of your learning progress.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};