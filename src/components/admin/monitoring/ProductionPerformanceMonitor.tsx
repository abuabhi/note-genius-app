
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductionMetrics } from '@/hooks/performance/useProductionMetrics';
import { usePerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { TrendingUp, Activity, Database, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

export const ProductionPerformanceMonitor = () => {
  const { metrics, logPerformanceIssue } = usePerformanceMonitor();
  const { getMetrics, clearMetrics, recordMetric } = useProductionMetrics('AdminPerformanceMonitor');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      const data = getMetrics();
      setPerformanceData(data);
      recordMetric('admin_metrics_refresh', Date.now());
    } catch (error) {
      logPerformanceIssue('Failed to refresh metrics', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPerformanceStatus = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return 'error';
    if (value >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => `${ms.toFixed(0)}ms`;
  const formatMemory = (mb: number) => `${mb.toFixed(1)}MB`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Monitoring</h2>
        <div className="flex gap-2">
          <Button onClick={refreshMetrics} disabled={isRefreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={clearMetrics} variant="outline" size="sm">
            Clear Metrics
          </Button>
        </div>
      </div>

      {/* Core Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Page Load Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.loadTime)}</div>
            <Badge className={getStatusColor(getPerformanceStatus(metrics.loadTime, { warning: 2000, error: 5000 }))}>
              {getPerformanceStatus(metrics.loadTime, { warning: 2000, error: 5000 })}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Render Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.renderTime)}</div>
            <Badge className={getStatusColor(getPerformanceStatus(metrics.renderTime, { warning: 100, error: 300 }))}>
              {getPerformanceStatus(metrics.renderTime, { warning: 100, error: 300 })}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Query Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.queryCount}</div>
            <div className="text-sm text-muted-foreground">
              {formatPercentage(metrics.cacheHitRate)} cache hit rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMemory(metrics.memoryUsage)}</div>
            <Badge className={getStatusColor(getPerformanceStatus(metrics.memoryUsage, { warning: 100, error: 200 }))}>
              {getPerformanceStatus(metrics.memoryUsage, { warning: 100, error: 200 })}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Data */}
      {performanceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Detailed Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <div>
                <h4 className="font-semibold mb-3">Recent Performance Events</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {performanceData.performance?.slice(-10).map((metric: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span>{metric.value.toFixed(2)}ms</span>
                        <span className="text-xs text-gray-500">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Query Performance */}
              <div>
                <h4 className="font-semibold mb-3">Query Performance</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {performanceData.queries?.slice(-10).map((query: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium truncate">{query.queryKey.substring(0, 30)}...</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={query.cacheHit ? "default" : "secondary"}>
                          {query.cacheHit ? 'Cache' : 'Fresh'}
                        </Badge>
                        <span>{query.duration.toFixed(0)}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Performance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.loadTime > 3000 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm">Slow page load detected: {formatDuration(metrics.loadTime)}</span>
              </div>
            )}
            {metrics.memoryUsage > 100 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm">High memory usage: {formatMemory(metrics.memoryUsage)}</span>
              </div>
            )}
            {metrics.cacheHitRate < 60 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm">Low cache hit rate: {formatPercentage(metrics.cacheHitRate)}</span>
              </div>
            )}
            {metrics.loadTime <= 3000 && metrics.memoryUsage <= 100 && metrics.cacheHitRate >= 60 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded">
                <Activity className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm">All performance metrics are within normal ranges</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
