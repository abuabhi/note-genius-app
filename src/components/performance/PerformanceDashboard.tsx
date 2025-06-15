
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { 
  Activity, 
  Clock, 
  Database, 
  Users, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Settings
} from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    metrics, 
    alerts, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring,
    getPerformanceSummary 
  } = usePerformanceMonitor();
  
  const { 
    collaborationState, 
    performanceMetrics, 
    isRealtimeEnabled,
    totalCount 
  } = useOptimizedNotes();

  const summary = getPerformanceSummary();

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-mint-600 hover:bg-mint-700 text-white shadow-lg"
          size="sm"
        >
          <Activity className="h-4 w-4 mr-2" />
          Performance
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {alerts.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-40 max-h-[80vh] overflow-y-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-mint-600" />
          <h3 className="font-semibold">Performance Monitor</h3>
          {isMonitoring ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            ×
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Overall Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {summary.overall === 'good' ? '✅' : '⚠️'}
              </span>
              <div className="text-right">
                <div className="text-sm text-gray-600">Overall Status</div>
                <div className={`font-medium ${
                  summary.overall === 'good' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {summary.overall === 'good' ? 'Excellent' : 'Needs Attention'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-xs text-gray-600">Load Time</div>
                  <div className="font-medium">{(summary.pageLoadTime / 1000).toFixed(1)}s</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-xs text-gray-600">Cache Hit</div>
                  <div className="font-medium">{summary.cacheHitRate}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-600">Memory</div>
                  <div className="font-medium">{summary.memoryUsage}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-xs text-gray-600">Notes</div>
                  <div className="font-medium">{totalCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Collaboration */}
        {isRealtimeEnabled && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <Badge variant="outline">
                  {collaborationState?.activeUsers?.length || 0}
                </Badge>
              </div>
              {collaborationState?.lastActivity && (
                <div className="text-xs text-gray-500 mt-1">
                  Last activity: {new Date(collaborationState.lastActivity).toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Performance Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alerts.slice(-3).map((alert, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={alert.type === 'error' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.type}
                      </Badge>
                      <span className="truncate">{alert.message}</span>
                    </div>
                    <div className="text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Detailed Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">API Response</span>
                <span>{summary.avgApiResponseTime.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Render Time</span>
                <span>{metrics.renderTime.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Critical Issues</span>
                <span className={summary.criticalIssues > 0 ? 'text-red-600' : 'text-green-600'}>
                  {summary.criticalIssues}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
