import { useCallback, useRef } from 'react';
import { EnhancementFunction } from '@/hooks/noteEnrichment/types';

interface CacheEntry {
  content: string;
  enhancementType: EnhancementFunction;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
}

export const useEnhancementCache = () => {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const statsRef = useRef({ hits: 0, misses: 0 });
  
  // Cache configuration
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  const MAX_CACHE_SIZE = 100; // Maximum number of cached enhancements
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Generate cache key from content and enhancement type
  const generateCacheKey = useCallback((content: string, enhancementType: EnhancementFunction): string => {
    // Create a hash-like key from content and type
    const contentHash = btoa(content.substring(0, 100)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    return `${enhancementType}_${contentHash}_${content.length}`;
  }, []);

  // Clean up expired entries
  const cleanup = useCallback(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of cacheRef.current) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => cacheRef.current.delete(key));

    // If still over limit, remove least recently used entries
    if (cacheRef.current.size > MAX_CACHE_SIZE) {
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const entriesToRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
      entriesToRemove.forEach(([key]) => cacheRef.current.delete(key));
    }

    console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`);
  }, []);

  // Get cached enhancement
  const getCachedEnhancement = useCallback((content: string, enhancementType: EnhancementFunction): string | null => {
    const key = generateCacheKey(content, enhancementType);
    const entry = cacheRef.current.get(key);

    if (!entry) {
      statsRef.current.misses++;
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      cacheRef.current.delete(key);
      statsRef.current.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    cacheRef.current.set(key, entry);
    
    statsRef.current.hits++;
    console.log(`🎯 Cache hit for ${enhancementType}: ${key}`);
    
    return entry.content;
  }, [generateCacheKey]);

  // Store enhancement in cache
  const setCachedEnhancement = useCallback((
    content: string, 
    enhancementType: EnhancementFunction, 
    enhancedContent: string
  ): void => {
    const key = generateCacheKey(content, enhancementType);
    const now = Date.now();

    const entry: CacheEntry = {
      content: enhancedContent,
      enhancementType,
      timestamp: now,
      expiresAt: now + CACHE_DURATION,
      accessCount: 1,
      lastAccessed: now
    };

    cacheRef.current.set(key, entry);
    console.log(`💾 Cached enhancement for ${enhancementType}: ${key}`);

    // Periodic cleanup
    if (Math.random() < 0.1) { // 10% chance to trigger cleanup
      cleanup();
    }
  }, [generateCacheKey, cleanup]);

  // Check if content should be cached (avoid caching very small or very large content)
  const shouldCache = useCallback((content: string): boolean => {
    const length = content.length;
    return length >= 500 && length <= 100000; // Cache content between 500 chars and 100KB
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback((): CacheStats => {
    const entries = Array.from(cacheRef.current.values());
    const now = Date.now();
    
    const totalRequests = statsRef.current.hits + statsRef.current.misses;
    const hitRate = totalRequests > 0 ? (statsRef.current.hits / totalRequests) * 100 : 0;
    
    const timestamps = entries.map(e => e.timestamp);
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : now;
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : now;
    
    // Rough memory usage estimation
    const memoryUsage = entries.reduce((total, entry) => {
      return total + entry.content.length * 2; // Rough estimation (UTF-16)
    }, 0);

    return {
      totalEntries: cacheRef.current.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: Math.round(memoryUsage / 1024), // KB
      oldestEntry,
      newestEntry
    };
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    statsRef.current = { hits: 0, misses: 0 };
    console.log('🗑️ Enhancement cache cleared');
  }, []);

  // Preload popular enhancements (could be called on app init)
  const preloadPopularEnhancements = useCallback((popularContent: Array<{ content: string; type: EnhancementFunction }>) => {
    popularContent.forEach(({ content, type }) => {
      if (shouldCache(content) && !getCachedEnhancement(content, type)) {
        // This would need to be called with actual enhanced content
        // setCachedEnhancement(content, type, enhancedContent);
      }
    });
  }, [shouldCache, getCachedEnhancement]);

  return {
    getCachedEnhancement,
    setCachedEnhancement,
    shouldCache,
    getCacheStats,
    clearCache,
    preloadPopularEnhancements
  };
};