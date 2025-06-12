
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, X, Zap } from 'lucide-react';
import { useUnifiedPerformanceMonitor } from '@/hooks/performance/useUnifiedPerformanceMonitor';
import { cn } from '@/lib/utils';

interface LightweightPerformanceOverlayProps {
  enabled?: boolean;
}

export const LightweightPerformanceOverlay = ({ enabled = process.env.NODE_ENV === 'development' }: LightweightPerformanceOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { metrics, alerts, isHealthy, forceCleanup } = useUnifiedPerformanceMonitor();

  // Don't render in production unless explicitly enabled
  if (!enabled) return null;

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms') return `${value.toFixed(0)}ms`;
    if (unit === 'MB') return `${value.toFixed(1)}MB`;
    if (unit === '%') return `${value.toFixed(1)}%`;
    return value.toString();
  };

  const getStatusColor = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700';
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className={cn(
          "fixed bottom-4 left-4 z-50 h-10 w-10 p-0",
          isHealthy ? "border-green-500" : "border-red-500"
        )}
        title="Performance Monitor"
      >
        <Activity className={cn("h-4 w-4", isHealthy ? "text-green-600" : "text-red-600")} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 bg-black/95 text-white border-gray-700 shadow-2xl">
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Performance</span>
            <Badge variant={isHealthy ? "default" : "destructive"} className="text-xs">
              {isHealthy ? 'Healthy' : 'Issues'}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              onClick={forceCleanup}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-gray-700"
              title="Force Cleanup"
            >
              <Zap className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white hover:bg-gray-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Memory:</span>
            <Badge variant="outline" className={getStatusColor(metrics.memoryUsage, 100, true)}>
              {formatValue(metrics.memoryUsage, 'MB')}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Cache:</span>
            <Badge variant="outline" className={getStatusColor(metrics.cacheHitRate, 60)}>
              {formatValue(metrics.cacheHitRate, '%')}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Queries:</span>
            <Badge variant="outline" className="border-gray-600 text-white">
              {metrics.queryCount}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Stale:</span>
            <Badge variant="outline" className={getStatusColor(metrics.staleQueries, 10, true)}>
              {metrics.staleQueries}
            </Badge>
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="border-t border-gray-700 pt-2">
            <div className="text-xs font-medium mb-1">Recent Alerts</div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className={cn(
                  "text-xs p-1 rounded",
                  alert.type === 'error' ? "bg-red-900/50" : "bg-yellow-900/50"
                )}>
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Summary */}
        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
          {isHealthy ? (
            "All systems operating normally"
          ) : (
            `${alerts.length} performance issue${alerts.length !== 1 ? 's' : ''} detected`
          )}
        </div>
      </div>
    </Card>
  );
};
