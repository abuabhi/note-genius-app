
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAdvancedCache } from '@/hooks/performance/useAdvancedCache';
import { useIntelligentPrefetch } from '@/hooks/performance/useIntelligentPrefetch';
import { useCacheMonitoring } from '@/hooks/performance/useCacheMonitoring';
import { 
  Activity, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MemoryStick,
  TrendingUp,
  Settings
} from 'lucide-react';

export const AdvancedCacheManager = () => {
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState(true);
  const [prefetchEnabled, setPrefetchEnabled] = useState(true);
  
  const {
    invalidateCache,
    startBackgroundSync,
    stopBackgroundSync,
    warmCache,
    getCacheStats
  } = useAdvancedCache();
  
  const {
    trackBehavior,
    triggerPrefetch,
    getBehaviorData
  } = useIntelligentPrefetch();
  
  const {
    metrics,
    alerts,
    clearAlerts,
    resetMetrics
  } = useCacheMonitoring();

  const [cacheStats, setCacheStats] = useState(getCacheStats());

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(getCacheStats());
    }, 2000);
    return () => clearInterval(interval);
  }, [getCacheStats]);

  // Manage background sync
  useEffect(() => {
    if (backgroundSyncEnabled) {
      startBackgroundSync({
        interval: 30000, // 30 seconds
        enabled: true,
        queryKeys: [
          ['optimized-notes'],
          ['user-subjects'],
          ['note-tags']
        ]
      });
    } else {
      stopBackgroundSync();
    }
  }, [backgroundSyncEnabled, startBackgroundSync, stopBackgroundSync]);

  const handleWarmCache = async () => {
    try {
      await warmCache();
    } catch (error) {
      console.error('Failed to warm cache:', error);
    }
  };

  const handleInvalidateAll = () => {
    invalidateCache('manual-invalidation');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Cache Manager</h2>
        <div className="flex gap-2">
          <Button onClick={handleWarmCache} variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Warm Cache
          </Button>
          <Button onClick={handleInvalidateAll} variant="outline" size="sm">
            <Database className="h-4 w-4 mr-2" />
            Invalidate All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="prefetch">Prefetching</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Total Queries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cacheStats.totalQueries}</div>
                <div className="text-xs text-muted-foreground">
                  {cacheStats.activeQueries} active
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Hit Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.hitRate)}</div>
                <Progress value={metrics.hitRate * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Avg Query Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageQueryTime.toFixed(0)}ms</div>
                <div className="text-xs text-muted-foreground">
                  {metrics.topSlowQueries.length} slow queries
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MemoryStick className="h-4 w-4 mr-2" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(metrics.memoryUsage)}</div>
                <div className="text-xs text-muted-foreground">
                  {cacheStats.staleQueries} stale
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                    Performance Alerts
                  </CardTitle>
                  <Button onClick={clearAlerts} variant="outline" size="sm">
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.slice(0, 5).map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded border">
                      <div className="flex items-center">
                        <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                          {alert.type}
                        </Badge>
                        <span className="ml-2 text-sm">{alert.message}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cache Hit Rate</label>
                  <Progress value={metrics.hitRate * 100} className="mt-1" />
                  <span className="text-xs text-muted-foreground">
                    {formatPercentage(metrics.hitRate)} (Target: 80%+)
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium">Query Success Rate</label>
                  <Progress 
                    value={metrics.totalQueries > 0 ? (metrics.totalQueries - metrics.errorQueries) / metrics.totalQueries * 100 : 0} 
                    className="mt-1" 
                  />
                  <span className="text-xs text-muted-foreground">
                    {metrics.errorQueries} errors out of {metrics.totalQueries}
                  </span>
                </div>
              </div>

              {metrics.topSlowQueries.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Slowest Queries</h4>
                  <div className="space-y-1">
                    {metrics.topSlowQueries.slice(0, 5).map((query, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="truncate">{query.queryKey}</span>
                        <span>{query.duration.toFixed(0)}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prefetch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Prefetching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Enable Prefetching</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically prefetch related data based on user behavior
                  </p>
                </div>
                <Switch 
                  checked={prefetchEnabled} 
                  onCheckedChange={setPrefetchEnabled}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => triggerPrefetch('note-view', { noteId: 'test' })}
                  variant="outline"
                  size="sm"
                >
                  Test Note Prefetch
                </Button>
                <Button 
                  onClick={() => triggerPrefetch('search-start', { term: 'test' })}
                  variant="outline"
                  size="sm"
                >
                  Test Search Prefetch
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Behavior Data</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(getBehaviorData(), null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Cache Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Background Sync</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically refresh cache in the background
                  </p>
                </div>
                <Switch 
                  checked={backgroundSyncEnabled} 
                  onCheckedChange={setBackgroundSyncEnabled}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={resetMetrics} variant="outline" size="sm">
                  Reset Metrics
                </Button>
                <Button onClick={clearAlerts} variant="outline" size="sm">
                  Clear Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
