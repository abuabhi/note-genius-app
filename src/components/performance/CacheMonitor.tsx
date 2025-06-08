import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Trash2, RefreshCw, Gauge } from 'lucide-react';

interface CacheStats {
  totalQueries: number;
  staleQueries: number;
  loadingQueries: number;
  errorQueries: number;
  cacheSize: number;
}

export const CacheMonitor = () => {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState<CacheStats>({
    totalQueries: 0,
    staleQueries: 0,
    loadingQueries: 0,
    errorQueries: 0,
    cacheSize: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  // Calculate cache stats
  useEffect(() => {
    const updateStats = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      setStats({
        totalQueries: queries.length,
        staleQueries: queries.filter(q => q.isStale()).length,
        loadingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
        errorQueries: queries.filter(q => q.state.status === 'error').length,
        cacheSize: JSON.stringify(queries.map(q => q.state.data)).length
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Cache management actions
  const clearCache = () => {
    queryClient.clear();
    console.log('🗑️ Cache cleared');
  };

  const invalidateStale = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.isStale()
    });
    console.log('🔄 Stale queries invalidated');
  };

  const refetchAll = () => {
    queryClient.refetchQueries();
    console.log('🔄 All queries refetched');
  };

  // Format cache size
  const formatCacheSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-white shadow-lg"
      >
        <Database className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Cache Monitor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Total Queries:</span>
            <Badge variant="secondary">{stats.totalQueries}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Stale:</span>
            <Badge variant={stats.staleQueries > 0 ? "destructive" : "secondary"}>
              {stats.staleQueries}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Loading:</span>
            <Badge variant={stats.loadingQueries > 0 ? "default" : "secondary"}>
              {stats.loadingQueries}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Errors:</span>
            <Badge variant={stats.errorQueries > 0 ? "destructive" : "secondary"}>
              {stats.errorQueries}
            </Badge>
          </div>
        </div>

        {/* Cache Size */}
        <div className="flex justify-between items-center text-xs">
          <span>Cache Size:</span>
          <Badge variant="outline">{formatCacheSize(stats.cacheSize)}</Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={invalidateStale}
            className="flex-1 text-xs"
            disabled={stats.staleQueries === 0}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Stale
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="flex-1 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>

        {/* Cache Health Indicator */}
        <div className="text-xs text-center">
          {stats.errorQueries > 0 ? (
            <span className="text-red-600">⚠️ Cache has errors</span>
          ) : stats.staleQueries > stats.totalQueries * 0.5 ? (
            <span className="text-orange-600">⚡ Many stale queries</span>
          ) : (
            <span className="text-green-600">✅ Cache healthy</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function formatCacheSize(bytes: number) {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function clearCache() {
  queryClient.clear();
  console.log('🗑️ Cache cleared');
}

function invalidateStale() {
  queryClient.invalidateQueries({
    predicate: (query) => query.isStale()
  });
  console.log('🔄 Stale queries invalidated');
}
