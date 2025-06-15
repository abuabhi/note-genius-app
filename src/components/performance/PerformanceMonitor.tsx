
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Zap, Database, TrendingUp, RefreshCw } from 'lucide-react';
import { useMemoryOptimization } from '@/hooks/performance/useMemoryOptimization';
import { useConnectionOptimization } from '@/hooks/performance/useConnectionOptimization';
import { useQueryOptimization } from '@/hooks/performance/useQueryOptimization';

interface PerformanceMonitorProps {
  show?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  show = process.env.NODE_ENV === 'development' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { getMemoryStats, getCacheSize, performCleanup } = useMemoryOptimization();
  const { getConnectionMetrics, resetMetrics } = useConnectionOptimization();
  const { getQueryStats } = useQueryOptimization();
  
  const [stats, setStats] = useState({
    memory: { current: 0, peak: 0 },
    cache: { size: 0 },
    connection: { activeConnections: 0, totalRequests: 0, averageResponseTime: 0, errorRate: 0 },
    query: { hits: 0, misses: 0, errors: 0, total: 0, hitRate: '0%' }
  });

  useEffect(() => {
    if (!show || !isVisible) return;

    const updateStats = () => {
      setStats({
        memory: getMemoryStats(),
        cache: { size: getCacheSize() },
        connection: getConnectionMetrics(),
        query: getQueryStats()
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, [show, isVisible, getMemoryStats, getCacheSize, getConnectionMetrics, getQueryStats]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Monitor className="h-4 w-4" />
        </Button>
      ) : (
        <Card className="w-80 bg-white shadow-xl border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Performance Monitor
              </div>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {/* Memory Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span>Memory</span>
              </div>
              <div className="text-right">
                <div>{Math.round(stats.memory.current)}MB / {Math.round(stats.memory.peak)}MB peak</div>
                <Badge variant={stats.memory.current > 80 ? "destructive" : "secondary"} className="text-xs">
                  {stats.cache.size} cached
                </Badge>
              </div>
            </div>

            {/* Connection Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3 text-blue-500" />
                <span>Connections</span>
              </div>
              <div className="text-right">
                <div>{stats.connection.activeConnections} active / {stats.connection.totalRequests} total</div>
                <div className="text-gray-500">
                  {Math.round(stats.connection.averageResponseTime)}ms avg
                </div>
              </div>
            </div>

            {/* Query Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>Queries</span>
              </div>
              <div className="text-right">
                <div>Hit rate: {stats.query.hitRate}</div>
                <div className="text-gray-500">
                  {stats.query.errors} errors / {stats.query.total} total
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={performCleanup}
                size="sm"
                variant="outline"
                className="flex-1 h-7"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Cleanup
              </Button>
              <Button
                onClick={resetMetrics}
                size="sm"
                variant="outline"
                className="flex-1 h-7"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
