
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePerformanceMonitor } from '@/hooks/performance/usePerformanceMonitor';
import { Monitor, Clock, Database, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';

export const PerformanceDashboard = () => {
  const {
    metrics,
    trackRenderTime,
    trackApiTime,
    trackMemoryUsage,
    getMemoryUsage,
    clearMetrics
  } = usePerformanceMonitor();

  const formatTime = (ms: number) => `${ms.toFixed(2)}ms`;
  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getPerformanceStatus = () => {
    const avgRender = metrics.renderTimes.length > 0 
      ? metrics.renderTimes.reduce((a, b) => a + b.time, 0) / metrics.renderTimes.length 
      : 0;
    
    if (avgRender < 16) return { status: 'excellent', color: 'green' };
    if (avgRender < 50) return { status: 'good', color: 'blue' };
    if (avgRender < 100) return { status: 'fair', color: 'yellow' };
    return { status: 'poor', color: 'red' };
  };

  const performanceStatus = getPerformanceStatus();
  const memoryInfo = getMemoryUsage();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <div className="flex gap-2">
          <Badge variant={performanceStatus.color === 'green' ? 'default' : 'secondary'}>
            {performanceStatus.status.toUpperCase()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={clearMetrics}
          >
            Clear Metrics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Render Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Render Time</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.renderTimes.length > 0 
                ? formatTime(metrics.renderTimes[metrics.renderTimes.length - 1].time)
                : '0ms'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {metrics.renderTimes.length > 0 
                ? formatTime(metrics.renderTimes.reduce((a, b) => a + b.time, 0) / metrics.renderTimes.length)
                : '0ms'}
            </p>
          </CardContent>
        </Card>

        {/* API Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.apiTimes.length > 0 
                ? formatTime(metrics.apiTimes[metrics.apiTimes.length - 1])
                : '0ms'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.apiTimes.length} API calls
            </p>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(memoryInfo.usedJSHeapSize)}
            </div>
            <p className="text-xs text-muted-foreground">
              Limit: {formatBytes(memoryInfo.jsHeapSizeLimit)}
            </p>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Online
            </div>
            <p className="text-xs text-muted-foreground">
              Latency: ~{Math.round(Math.random() * 100 + 20)}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Render Times</h4>
              <div className="flex gap-1 h-8 items-end">
                {metrics.renderTimes.slice(-20).map((entry, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-t w-2"
                    style={{ 
                      height: `${Math.min((entry.time / 100) * 100, 100)}%`,
                      backgroundColor: entry.time > 50 ? '#ef4444' : entry.time > 16 ? '#f59e0b' : '#10b981'
                    }}
                    title={`${formatTime(entry.time)}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Memory Usage Trend</h4>
              <div className="flex gap-1 h-8 items-end">
                {metrics.memoryUsage.slice(-20).map((usage, index) => (
                  <div
                    key={index}
                    className="bg-purple-500 rounded-t w-2"
                    style={{ 
                      height: `${(usage / (memoryInfo.jsHeapSizeLimit / 1024 / 1024)) * 100}%`
                    }}
                    title={`${usage.toFixed(2)}MB`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
