
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, X, Zap, AlertTriangle } from 'lucide-react';
import { useConsolidatedPerformanceMonitor } from '@/hooks/performance/useConsolidatedPerformanceMonitor';
import { cn } from '@/lib/utils';

interface LightweightPerformanceOverlayProps {
  enabled?: boolean;
}

export const LightweightPerformanceOverlay = ({ 
  enabled = process.env.NODE_ENV === 'development' 
}: LightweightPerformanceOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { metrics, alerts, isHealthy, forceCleanup } = useConsolidatedPerformanceMonitor(enabled);

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
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className={cn(
          "fixed bottom-4 left-4 z-50 h-8 w-8 p-0",
          isHealthy ? "border-green-500" : "border-red-500"
        )}
        title="Performance Monitor"
      >
        <Activity className={cn("h-3 w-3", isHealthy ? "text-green-600" : "text-red-600")} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-72 bg-black/95 text-white border-gray-700 shadow-xl">
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            <span className="text-xs font-medium">Performance</span>
            <Badge variant={isHealthy ? "default" : "destructive"} className="text-xs">
              {isHealthy ? 'OK' : 'Issues'}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              onClick={forceCleanup}
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-white hover:bg-gray-700"
              title="Cleanup"
            >
              <Zap className="h-2 w-2" />
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-white hover:bg-gray-700"
            >
              <X className="h-2 w-2" />
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="flex justify-between">
            <span>Mem:</span>
            <span className={getStatusColor(metrics.memoryUsage, 100, true)}>
              {formatValue(metrics.memoryUsage, 'MB')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cache:</span>
            <span className={getStatusColor(metrics.cacheHitRate, 60)}>
              {formatValue(metrics.cacheHitRate, '%')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Queries:</span>
            <span className="text-white">{metrics.queryCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Stale:</span>
            <span className={getStatusColor(metrics.staleQueries, 10, true)}>
              {metrics.staleQueries}
            </span>
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="border-t border-gray-700 pt-1">
            <div className="text-xs font-medium mb-1 flex items-center gap-1">
              <AlertTriangle className="h-2 w-2" />
              Alerts
            </div>
            <div className="space-y-1 max-h-16 overflow-y-auto">
              {alerts.slice(0, 2).map((alert, index) => (
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
      </div>
    </Card>
  );
};
