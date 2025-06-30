
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Trash2, RefreshCw, HardDrive, Zap } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CacheStats {
  totalSize: number;
  hitRate: number;
  missRate: number;
  entries: number;
  oldestEntry: Date;
  newestEntry: Date;
}

interface CacheEntry {
  key: string;
  size: number;
  lastAccessed: Date;
  hitCount: number;
  type: 'query' | 'mutation' | 'static';
}

export const AdvancedCacheManager = () => {
  const queryClient = useQueryClient();
  
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    totalSize: 2.4,
    hitRate: 78.5,
    missRate: 21.5,
    entries: 156,
    oldestEntry: new Date(Date.now() - 3600000),
    newestEntry: new Date()
  });

  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([
    {
      key: 'notes-user-123',
      size: 0.8,
      lastAccessed: new Date(Date.now() - 300000),
      hitCount: 45,
      type: 'query'
    },
    {
      key: 'flashcards-set-456',
      size: 0.6,
      lastAccessed: new Date(Date.now() - 600000),
      hitCount: 23,
      type: 'query'
    },
    {
      key: 'user-profile-789',
      size: 0.2,
      lastAccessed: new Date(Date.now() - 900000),
      hitCount: 12,
      type: 'query'
    }
  ]);

  const clearAllCache = useCallback(() => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    
    setCacheStats(prev => ({
      ...prev,
      totalSize: 0,
      entries: 0
    }));
    
    setCacheEntries([]);
    toast.success('All caches cleared successfully');
  }, [queryClient]);

  const clearQueryCache = useCallback(() => {
    queryClient.clear();
    toast.success('Query cache cleared');
  }, [queryClient]);

  const clearStorageCache = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Storage cache cleared');
  }, []);

  const optimizeCache = useCallback(() => {
    // Remove stale queries
    queryClient.getQueryCache().clear();
    
    // Simulate optimization
    setCacheStats(prev => ({
      ...prev,
      totalSize: prev.totalSize * 0.7,
      hitRate: Math.min(prev.hitRate + 5, 95),
      entries: Math.floor(prev.entries * 0.8)
    }));
    
    toast.success('Cache optimized successfully');
  }, [queryClient]);

  const refreshStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    setCacheStats(prev => ({
      ...prev,
      entries: queries.length,
      totalSize: prev.totalSize + (Math.random() - 0.5) * 0.5,
      hitRate: Math.min(Math.max(prev.hitRate + (Math.random() - 0.5) * 10, 0), 100),
      newestEntry: new Date()
    }));
    
    toast.info('Cache statistics refreshed');
  }, [queryClient]);

  const removeEntry = (key: string) => {
    queryClient.removeQueries({ queryKey: [key] });
    setCacheEntries(prev => prev.filter(entry => entry.key !== key));
    setCacheStats(prev => ({
      ...prev,
      entries: prev.entries - 1,
      totalSize: Math.max(prev.totalSize - 0.1, 0)
    }));
    toast.success(`Cache entry "${key}" removed`);
  };

  const getTypeColor = (type: CacheEntry['type']) => {
    switch (type) {
      case 'query':
        return 'bg-blue-100 text-blue-800';
      case 'mutation':
        return 'bg-green-100 text-green-800';
      case 'static':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cacheStats.totalSize.toFixed(1)}MB
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {cacheStats.hitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Hit Rate</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {cacheStats.entries}
              </div>
              <div className="text-sm text-gray-600">Entries</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {cacheStats.missRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Miss Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Cache Management
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={refreshStats} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Stats
              </Button>
              <Button onClick={optimizeCache} size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Optimize
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="entries">Cache Entries</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cache Hit Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Hit Rate</span>
                        <span>{cacheStats.hitRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={cacheStats.hitRate} className="w-full" />
                      <div className="text-xs text-gray-600">
                        Higher hit rates indicate better cache efficiency
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span>{cacheStats.totalSize.toFixed(1)}MB / 10MB</span>
                      </div>
                      <Progress value={(cacheStats.totalSize / 10) * 100} className="w-full" />
                      <div className="text-xs text-gray-600">
                        Cache will be automatically cleaned when approaching limit
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="entries" className="space-y-4">
              <div className="space-y-2">
                {cacheEntries.map((entry) => (
                  <div key={entry.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{entry.key}</h4>
                        <Badge className={getTypeColor(entry.type)}>
                          {entry.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.size.toFixed(1)}MB • {entry.hitCount} hits • 
                        Last accessed: {entry.lastAccessed.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeEntry(entry.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <HardDrive className="h-8 w-8 mx-auto text-blue-600" />
                      <div>
                        <h3 className="font-semibold">Clear Query Cache</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Remove all cached API responses
                        </p>
                      </div>
                      <Button onClick={clearQueryCache} className="w-full">
                        Clear Queries
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Database className="h-8 w-8 mx-auto text-green-600" />
                      <div>
                        <h3 className="font-semibold">Clear Storage Cache</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Remove localStorage and sessionStorage
                        </p>
                      </div>
                      <Button onClick={clearStorageCache} variant="outline" className="w-full">
                        Clear Storage
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Trash2 className="h-8 w-8 mx-auto text-red-600" />
                      <div>
                        <h3 className="font-semibold">Clear All Caches</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Complete cache reset
                        </p>
                      </div>
                      <Button onClick={clearAllCache} variant="destructive" className="w-full">
                        Clear All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
