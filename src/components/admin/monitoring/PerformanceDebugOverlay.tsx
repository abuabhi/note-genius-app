
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Activity } from 'lucide-react';
import { usePerformanceMonitor } from '@/components/performance/PerformanceMonitor';

export const PerformanceDebugOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { metrics } = usePerformanceMonitor();

  const formatDuration = (ms: number) => `${ms.toFixed(0)}ms`;
  const formatMemory = (mb: number) => `${mb.toFixed(1)}MB`;

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4 mr-2" />
        Show Debug
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-48 bg-black/90 text-white border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Activity className="h-3 w-3 mr-1" />
            Performance
          </CardTitle>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-white hover:bg-gray-700"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Load:</span>
          <Badge variant="outline" className="text-xs border-gray-600 text-white">
            {formatDuration(metrics.loadTime)}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Render:</span>
          <Badge variant="outline" className="text-xs border-gray-600 text-white">
            {formatDuration(metrics.renderTime)}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Queries:</span>
          <Badge variant="outline" className="text-xs border-gray-600 text-white">
            {metrics.queryCount}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Cache:</span>
          <Badge variant="outline" className="text-xs border-gray-600 text-white">
            {metrics.cacheHitRate.toFixed(1)}%
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Memory:</span>
          <Badge variant="outline" className="text-xs border-gray-600 text-white">
            {formatMemory(metrics.memoryUsage)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
