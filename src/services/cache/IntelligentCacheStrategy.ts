interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: MemoryInfo;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  priority: 'high' | 'normal' | 'low';
  tags: string[];
  accessCount: number;
  lastAccessed: number;
  size?: number;
}

interface CacheOptions {
  ttl?: number;
  priority?: 'high' | 'normal' | 'low';
  tags?: string[];
}

interface AccessPattern {
  hits: number;
  misses: number;
  writes: number;
  expirations: number;
}

class IntelligentCacheStrategy {
  private cache = new Map<string, CacheEntry>();
  private accessPatterns = new Map<string, AccessPattern>();
  private memoryPressureThreshold = 150 * 1024 * 1024; // 150MB
  private maxCacheSize = 1000;
  private ttlDefault = 10 * 60 * 1000; // 10 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
    this.setupMemoryPressureDetection();
  }

  set(key: string, data: any, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.ttlDefault;
    const priority = options.priority || 'normal';
    const tags = options.tags || [];

    // Check memory pressure before adding
    if (this.isMemoryPressureHigh() && priority === 'low') {
      console.log('🚫 [CACHE] Skipping low priority cache due to memory pressure');
      return;
    }

    // Clean up if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      priority,
      tags,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.estimateSize(data)
    };

    this.cache.set(key, entry);
    this.updateAccessPattern(key, 'write');

    console.log(`💾 [CACHE] Stored: ${key} (Size: ${entry.size} bytes, TTL: ${ttl}ms)`);
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.updateAccessPattern(key, 'miss');
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateAccessPattern(key, 'expired');
      console.log(`⏰ [CACHE] Expired: ${key}`);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.updateAccessPattern(key, 'hit');

    console.log(`✅ [CACHE] Hit: ${key} (Access count: ${entry.accessCount})`);
    return entry.data;
  }

  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      console.log(`🗑️ [CACHE] Invalidated: ${key}`);
    }
  }

  invalidateByTags(tags: string[]): void {
    let invalidatedCount = 0;
    this.cache.forEach((entry, key) => {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    });
    console.log(`🗑️ [CACHE] Invalidated ${invalidatedCount} entries with tags: ${tags.join(', ')}`);
  }

  clear(): void {
    this.cache.clear();
    this.accessPatterns.clear();
    console.log('🧹 [CACHE] Cache cleared');
  }

  private isMemoryPressureHigh(): boolean {
    try {
      const perf = performance as PerformanceWithMemory;
      if (perf.memory?.usedJSHeapSize) {
        const memoryUsage = perf.memory.usedJSHeapSize;
        return memoryUsage > this.memoryPressureThreshold;
      }
    } catch (error) {
      console.warn('⚠️ [CACHE] Memory API not available, using fallback detection');
    }
    
    // Fallback: use cache size as proxy for memory pressure
    return this.cache.size > this.maxCacheSize * 0.8;
  }

  handleMemoryPressure(): void {
    console.log('🚨 [CACHE] Memory pressure detected, performing aggressive cleanup');
    
    // Remove low priority items first
    const lowPriorityKeys = Array.from(this.cache.entries())
      .filter(([_, entry]) => entry.priority === 'low')
      .map(([key]) => key);
    
    lowPriorityKeys.forEach(key => this.cache.delete(key));
    
    // If still high pressure, remove least recently used items
    if (this.isMemoryPressureHigh()) {
      const lruKeys = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
        .slice(0, Math.floor(this.cache.size * 0.3))
        .map(([key]) => key);
      
      lruKeys.forEach(key => this.cache.delete(key));
    }
    
    console.log(`🧹 [CACHE] Cleanup completed, cache size: ${this.cache.size}`);
  }

  private setupMemoryPressureDetection(): void {
    // Check memory pressure every 30 seconds
    setInterval(() => {
      if (this.isMemoryPressureHigh()) {
        this.handleMemoryPressure();
      }
    }, 30000);
  }

  private evictLeastRecentlyUsed(): void {
    let lruKey: string | null = null;
    let lruTimestamp = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.lastAccessed < lruTimestamp) {
        lruTimestamp = entry.lastAccessed;
        lruKey = key;
      }
    });

    if (lruKey) {
      this.cache.delete(lruKey);
      console.log(`🗑️ [CACHE] Evicted LRU entry: ${lruKey}`);
    }
  }

  private performCleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    });

    if (expiredCount > 0) {
      console.log(`🧹 [CACHE] Cleaned up ${expiredCount} expired entries`);
    }
  }

  private updateAccessPattern(key: string, type: 'hit' | 'miss' | 'write' | 'expired'): void {
    const pattern = this.accessPatterns.get(key) || { hits: 0, misses: 0, writes: 0, expirations: 0 };
    
    switch (type) {
      case 'hit':
        pattern.hits++;
        break;
      case 'miss':
        pattern.misses++;
        break;
      case 'write':
        pattern.writes++;
        break;
      case 'expired':
        pattern.expirations++;
        break;
    }

    this.accessPatterns.set(key, pattern);
  }

  private estimateSize(data: any): number {
    try {
      const str = JSON.stringify(data);
      return new TextEncoder().encode(str).length;
    } catch (error) {
      console.warn('⚠️ [CACHE] Could not estimate size of data');
      return 0;
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60000); // Every minute
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  getMetrics(): {
    size: number;
    hitRate: string;
    memoryUsage: string;
    totalHits: number;
    totalMisses: number;
    averageAccessCount: number;
  } {
    const totalEntries = Array.from(this.accessPatterns.values());
    const totalHits = totalEntries.reduce((sum, pattern) => sum + pattern.hits, 0);
    const totalMisses = totalEntries.reduce((sum, pattern) => sum + pattern.misses, 0);
    const totalAccesses = totalHits + totalMisses;
    const hitRate = totalAccesses > 0 ? ((totalHits / totalAccesses) * 100).toFixed(1) : '0';
    
    const cacheEntries = Array.from(this.cache.values());
    const averageAccessCount = cacheEntries.length > 0 
      ? (cacheEntries.reduce((sum, entry) => sum + entry.accessCount, 0) / cacheEntries.length).toFixed(1)
      : '0';
    
    let memoryUsage = 'Unknown';
    try {
      const perf = performance as PerformanceWithMemory;
      if (perf.memory?.usedJSHeapSize) {
        memoryUsage = `${Math.round(perf.memory.usedJSHeapSize / 1024 / 1024)}MB`;
      }
    } catch (error) {
      // Fallback to cache size estimation
      const estimatedSize = cacheEntries.reduce((sum, entry) => sum + (entry.size || 0), 0);
      memoryUsage = `~${Math.round(estimatedSize / 1024)}KB (estimated)`;
    }

    return {
      size: this.cache.size,
      hitRate: `${hitRate}%`,
      memoryUsage,
      totalHits,
      totalMisses,
      averageAccessCount: parseFloat(averageAccessCount),
    };
  }
}

const intelligentCacheManager = new IntelligentCacheStrategy();

export { IntelligentCacheStrategy, intelligentCacheManager, CacheOptions };
