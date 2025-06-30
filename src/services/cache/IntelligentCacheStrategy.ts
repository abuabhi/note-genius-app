import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

interface CacheConfig {
  staleTime: number;
  gcTime: number;
  maxAge?: number;
  priority: 'low' | 'medium' | 'high';
  prefetchOnHover?: boolean;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  memoryUsage: number;
  averageAccessTime: number;
}

class IntelligentCacheManager {
  private accessPatterns: Map<string, number[]> = new Map();
  private hitRates: Map<string, number> = new Map();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    memoryUsage: 0,
    averageAccessTime: 0,
  };

  // Adaptive cache configurations based on usage patterns
  private cacheConfigs: Record<string, CacheConfig> = {
    // High-frequency, rarely changing data
    static: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 60 * 60 * 1000, // 1 hour
      priority: 'high',
      prefetchOnHover: false,
    },
    
    // User-specific data
    user: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      priority: 'high',
      prefetchOnHover: true,
    },
    
    // Frequently changing data
    dynamic: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      priority: 'medium',
      prefetchOnHover: false,
    },
    
    // Background/analytics data
    background: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      priority: 'low',
      prefetchOnHover: false,
    },
    
    // Real-time data
    realtime: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 2 * 60 * 1000, // 2 minutes
      priority: 'medium',
      prefetchOnHover: false,
    }
  };

  getCacheConfig(queryKey: readonly unknown[]): CacheConfig {
    const keyString = JSON.stringify([...queryKey]);
    
    // Analyze access patterns to determine optimal config
    const accessTimes = this.accessPatterns.get(keyString) || [];
    const recentAccesses = accessTimes.filter(time => Date.now() - time < 60000).length;
    
    if (keyString.includes('profile') || keyString.includes('settings')) {
      return this.cacheConfigs.static;
    }
    
    if (keyString.includes('user') || keyString.includes('dashboard')) {
      return this.cacheConfigs.user;
    }
    
    if (keyString.includes('realtime') || keyString.includes('notifications')) {
      return this.cacheConfigs.realtime;
    }
    
    if (keyString.includes('analytics') || keyString.includes('metrics')) {
      return this.cacheConfigs.background;
    }
    
    // Adaptive configuration based on access frequency
    if (recentAccesses > 5) {
      return {
        ...this.cacheConfigs.dynamic,
        staleTime: this.cacheConfigs.dynamic.staleTime * 0.5, // More aggressive refresh
        priority: 'high'
      };
    }
    
    return this.cacheConfigs.dynamic;
  }

  recordAccess(queryKey: readonly unknown[]): void {
    const keyString = JSON.stringify([...queryKey]);
    const now = Date.now();
    
    const accesses = this.accessPatterns.get(keyString) || [];
    accesses.push(now);
    
    // Keep only recent accesses (last hour)
    const recentAccesses = accesses.filter(time => now - time < 3600000);
    this.accessPatterns.set(keyString, recentAccesses);
  }

  recordHit(queryKey: readonly unknown[]): void {
    this.metrics.hits++;
    this.recordAccess(queryKey);
    
    const keyString = JSON.stringify([...queryKey]);
    const currentHitRate = this.hitRates.get(keyString) || 0;
    this.hitRates.set(keyString, currentHitRate + 1);
  }

  recordMiss(queryKey: readonly unknown[]): void {
    this.metrics.misses++;
    this.recordAccess(queryKey);
  }

  // Predictive prefetching based on usage patterns
  getPrefetchCandidates(): string[][] {
    const candidates: string[][] = [];
    const now = Date.now();
    
    for (const [keyString, accesses] of this.accessPatterns) {
      // If accessed frequently in the last 10 minutes, likely to be accessed again
      const recentAccesses = accesses.filter(time => now - time < 600000);
      if (recentAccesses.length >= 3) {
        try {
          const queryKey = JSON.parse(keyString);
          candidates.push(queryKey);
        } catch (error) {
          // Invalid JSON, skip
        }
      }
    }
    
    return candidates.slice(0, 5); // Limit to top 5 candidates
  }

  getMetrics(): CacheMetrics & { hitRate: string } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? ((this.metrics.hits / total) * 100).toFixed(1) : '0';
    
    return {
      ...this.metrics,
      hitRate: `${hitRate}%`
    };
  }

  // Memory pressure handling
  handleMemoryPressure(): void {
    this.metrics.evictions++;
    
    // Sort queries by priority and access frequency
    const queries = Array.from(this.accessPatterns.entries())
      .map(([keyString, accesses]) => ({
        keyString,
        lastAccess: Math.max(...accesses),
        accessCount: accesses.length,
        priority: this.getCacheConfig(JSON.parse(keyString)).priority
      }))
      .sort((a, b) => {
        // Sort by priority first, then by last access
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.lastAccess - b.lastAccess;
      });
    
    // Remove oldest, lowest priority entries
    const toRemove = queries.slice(0, Math.floor(queries.length * 0.2));
    toRemove.forEach(({ keyString }) => {
      this.accessPatterns.delete(keyString);
      this.hitRates.delete(keyString);
    });
  }

  // Cleanup old data
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [keyString, accesses] of this.accessPatterns) {
      const recentAccesses = accesses.filter(time => now - time < maxAge);
      if (recentAccesses.length === 0) {
        this.accessPatterns.delete(keyString);
        this.hitRates.delete(keyString);
      } else {
        this.accessPatterns.set(keyString, recentAccesses);
      }
    }
  }
}

export const intelligentCacheManager = new IntelligentCacheManager();

export const useIntelligentCache = () => {
  const queryClient = useQueryClient();
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set up automatic cleanup
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      intelligentCacheManager.cleanup();
      
      // Check memory usage and handle pressure if needed
      if (performance.memory && (performance.memory as any).usedJSHeapSize > 100 * 1024 * 1024) {
        intelligentCacheManager.handleMemoryPressure();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  // Intelligent prefetching
  const prefetchIntelligently = useCallback(async () => {
    const candidates = intelligentCacheManager.getPrefetchCandidates();
    
    for (const queryKey of candidates) {
      const config = intelligentCacheManager.getCacheConfig(queryKey);
      if (config.prefetchOnHover) {
        try {
          await queryClient.prefetchQuery({
            queryKey,
            staleTime: config.staleTime,
            gcTime: config.gcTime,
          });
        } catch (error) {
          // Prefetch failed, not critical
          console.debug('Prefetch failed for:', queryKey);
        }
      }
    }
  }, [queryClient]);

  // Enhanced query with intelligent caching
  const intelligentQuery = useCallback((queryKey: readonly unknown[]) => {
    const config = intelligentCacheManager.getCacheConfig(queryKey);
    intelligentCacheManager.recordAccess(queryKey);
    
    return {
      queryKey: [...queryKey],
      staleTime: config.staleTime,
      gcTime: config.gcTime,
      meta: {
        priority: config.priority,
      },
    };
  }, []);

  return {
    intelligentQuery,
    prefetchIntelligently,
    getCacheMetrics: intelligentCacheManager.getMetrics.bind(intelligentCacheManager),
    handleMemoryPressure: intelligentCacheManager.handleMemoryPressure.bind(intelligentCacheManager),
  };
};
