
import { useEffect, useRef, useCallback } from 'react';
import { useManagedInterval } from '@/utils/performance';

interface MemoryOptimizationConfig {
  maxCacheSize: number;
  cleanupInterval: number;
  maxMemoryUsage: number; // in MB
}

export const useMemoryOptimization = (config: MemoryOptimizationConfig = {
  maxCacheSize: 1000,
  cleanupInterval: 300000, // 5 minutes
  maxMemoryUsage: 100
}) => {
  const cacheRef = useRef(new Map());
  const memoryStatsRef = useRef({ peak: 0, current: 0 });

  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const currentMB = memInfo.usedJSHeapSize / 1024 / 1024;
      memoryStatsRef.current.current = currentMB;
      memoryStatsRef.current.peak = Math.max(memoryStatsRef.current.peak, currentMB);
      
      console.log('📊 [MEMORY] Current usage:', Math.round(currentMB), 'MB, Peak:', Math.round(memoryStatsRef.current.peak), 'MB');
      
      return currentMB;
    }
    return 0;
  }, []);

  const clearCache = useCallback((reason = 'manual') => {
    const itemsCleared = cacheRef.current.size;
    cacheRef.current.clear();
    console.log('🧹 [MEMORY] Cache cleared:', itemsCleared, 'items, Reason:', reason);
  }, []);

  const addToCache = useCallback((key: string, value: any) => {
    const cache = cacheRef.current;
    
    // Remove oldest items if cache is full
    if (cache.size >= config.maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    });
  }, [config.maxCacheSize]);

  const getFromCache = useCallback((key: string) => {
    const cache = cacheRef.current;
    const item = cache.get(key);
    
    if (item) {
      item.accessCount++;
      item.lastAccessed = Date.now();
      return item.value;
    }
    
    return null;
  }, []);

  const performCleanup = useCallback(() => {
    const currentMemory = measureMemoryUsage();
    
    if (currentMemory > config.maxMemoryUsage) {
      console.log('⚠️ [MEMORY] High memory usage detected, performing cleanup');
      clearCache('high_memory');
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
    }
    
    // Clean old cache entries
    const cache = cacheRef.current;
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp > 600000) { // 10 minutes old
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log('🧹 [MEMORY] Cleaned up', expiredKeys.length, 'expired cache entries');
    }
  }, [config.maxMemoryUsage, measureMemoryUsage, clearCache]);

  // Set up managed cleanup interval
  useManagedInterval('memory-cleanup', performCleanup, config.cleanupInterval);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCache('component_unmount');
    };
  }, [clearCache]);

  return {
    addToCache,
    getFromCache,
    clearCache,
    performCleanup,
    measureMemoryUsage,
    getMemoryStats: () => memoryStatsRef.current,
    getCacheSize: () => cacheRef.current.size
  };
};
