import { z } from 'zod';

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  priority: number;
  tags: string[];
  size: number;
}

interface CacheMetrics {
  hitRate: string;
  totalRequests: number;
  hits: number;
  misses: number;
  memoryUsage: string;
  entryCount: number;
  avgAccessTime: number;
  evictions: number;
}

interface CacheConfig {
  maxSize: number;
  maxAge: number;
  maxMemoryUsage: number;
  compressionThreshold: number;
  enableCompression: boolean;
  enablePersistence: boolean;
  persistenceKey: string;
}

export class IntelligentCacheManager {
  private cache = new Map<string, CacheEntry>();
  private accessTimes = new Map<string, number[]>();
  private metrics: CacheMetrics = {
    hitRate: '0%',
    totalRequests: 0,
    hits: 0,
    misses: 0,
    memoryUsage: '0MB',
    entryCount: 0,
    avgAccessTime: 0,
    evictions: 0,
  };

  private config: CacheConfig = {
    maxSize: 1000,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    compressionThreshold: 1024, // 1KB
    enableCompression: true,
    enablePersistence: true,
    persistenceKey: 'intelligent-cache',
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadFromPersistence();
    this.startCleanupInterval();
  }

  set<T>(key: string, data: T, options?: { tags?: string[]; priority?: number; ttl?: number }): void {
    const now = Date.now();
    const size = this.estimateSize(data);
    const maxAge = options?.ttl ?? this.config.maxAge;

    // Check memory pressure before adding
    if (this.shouldEvictForMemory(size)) {
      this.performMemoryPressureEviction();
    }

    const entry: CacheEntry<T> = {
      data: this.config.enableCompression && size > this.config.compressionThreshold 
        ? this.compress(data) 
        : data,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
      priority: options?.priority ?? 1,
      tags: options?.tags ?? [],
      size,
    };

    this.cache.set(key, entry);
    this.updateMetrics();
    this.persistCache();
  }

  get<T>(key: string): T | null {
    const now = Date.now();
    this.metrics.totalRequests++;

    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (now - entry.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access metrics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.recordAccessTime(key, now);

    this.metrics.hits++;
    this.updateHitRate();

    // Decompress if needed
    const data = this.isCompressed(entry.data) ? this.decompress(entry.data) : entry.data;
    return data as T;
  }

  private recordAccessTime(key: string, time: number): void {
    if (!this.accessTimes.has(key)) {
      this.accessTimes.set(key, []);
    }
    const times = this.accessTimes.get(key)!;
    times.push(time);
    if (times.length > 100) {
      times.shift();
    }
  }

  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return JSON.stringify(data).length * 2;
    }
  }

  private compress(data: any): any {
    // Simple compression simulation - in real implementation use actual compression
    return { __compressed: true, data: JSON.stringify(data) };
  }

  private decompress(data: any): any {
    if (this.isCompressed(data)) {
      return JSON.parse(data.data);
    }
    return data;
  }

  private isCompressed(data: any): boolean {
    return data && typeof data === 'object' && data.__compressed === true;
  }

  private shouldEvictForMemory(newEntrySize: number): boolean {
    const currentMemory = this.getCurrentMemoryUsage();
    return currentMemory + newEntrySize > this.config.maxMemoryUsage;
  }

  private getCurrentMemoryUsage(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.size;
    }
    return total;
  }

  private performMemoryPressureEviction(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by LRU with priority weighting
    entries.sort(([, a], [, b]) => {
      const scoreA = a.lastAccessed * a.priority;
      const scoreB = b.lastAccessed * b.priority;
      return scoreA - scoreB;
    });

    // Remove 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
      this.metrics.evictions++;
    }
  }

  private updateMetrics(): void {
    this.metrics.entryCount = this.cache.size;
    this.metrics.memoryUsage = `${(this.getCurrentMemoryUsage() / 1024 / 1024).toFixed(2)}MB`;
    
    // Calculate average access time
    let totalAccessTime = 0;
    let accessCount = 0;
    for (const times of this.accessTimes.values()) {
      if (times.length > 1) {
        for (let i = 1; i < times.length; i++) {
          totalAccessTime += times[i] - times[i-1];
          accessCount++;
        }
      }
    }
    this.metrics.avgAccessTime = accessCount > 0 ? totalAccessTime / accessCount : 0;
  }

  private updateHitRate(): void {
    const rate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests * 100).toFixed(1)
      : '0';
    this.metrics.hitRate = `${rate}%`;
  }

  private cleanupIntervalId: NodeJS.Timeout | null = null;

  private startCleanupInterval(): void {
    this.cleanupIntervalId = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  // Cleanup method to stop interval and free resources
  destroy(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    this.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.maxAge) {
        expired.push(key);
      }
    }

    expired.forEach(key => this.cache.delete(key));
    
    if (expired.length > 0) {
      this.updateMetrics();
      this.persistCache();
    }
  }

  private loadFromPersistence(): void {
    if (!this.config.enablePersistence || typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.config.persistenceKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data.entries);
        this.metrics = { ...this.metrics, ...data.metrics };
      }
    } catch (error) {
      console.warn('Failed to load cache from persistence:', error);
    }
  }

  private persistCache(): void {
    if (!this.config.enablePersistence || typeof localStorage === 'undefined') return;

    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        metrics: this.metrics,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }

  handleMemoryPressure(): void {
    const performanceMemory = performance as PerformanceWithMemory;
    if (performanceMemory.memory) {
      const memoryUsage = performanceMemory.memory.usedJSHeapSize;
      const memoryLimit = performanceMemory.memory.jsHeapSizeLimit;
      
      if (memoryUsage / memoryLimit > 0.8) {
        this.performMemoryPressureEviction();
      }
    } else {
      // Fallback: aggressive cleanup when memory API unavailable
      this.performMemoryPressureEviction();
    }
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
    this.metrics = {
      hitRate: '0%',
      totalRequests: 0,
      hits: 0,
      misses: 0,
      memoryUsage: '0MB',
      entryCount: 0,
      avgAccessTime: 0,
      evictions: 0,
    };
    this.persistCache();
  }

  invalidateByTag(tag: string): void {
    const toDelete: string[] = [];
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        toDelete.push(key);
      }
    }
    toDelete.forEach(key => this.cache.delete(key));
    this.updateMetrics();
    this.persistCache();
  }
}

export const intelligentCacheManager = new IntelligentCacheManager();

// Fix the export to use 'export type' for type-only exports
export type { CacheEntry, CacheMetrics, CacheConfig };
