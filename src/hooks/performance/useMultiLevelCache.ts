
import { useCallback, useRef, useEffect } from 'react';
import { logger } from '@/config/environment';

interface CacheEntry {
  data: any;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  priority: 'high' | 'medium' | 'low';
}

interface CacheConfig {
  maxMemorySize: number; // bytes
  maxLocalStorageSize: number; // bytes
  defaultTTL: number; // milliseconds
  compressionThreshold: number; // bytes
}

const DEFAULT_CONFIG: CacheConfig = {
  maxMemorySize: 50 * 1024 * 1024, // 50MB
  maxLocalStorageSize: 10 * 1024 * 1024, // 10MB
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  compressionThreshold: 1024 // 1KB
};

export const useMultiLevelCache = (config: Partial<CacheConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Level 1: Memory cache (fastest)
  const memoryCache = useRef<Map<string, CacheEntry>>(new Map());
  
  // Level 2: IndexedDB cache (persistent, larger)
  const indexedDBRef = useRef<IDBDatabase | null>(null);
  
  // Cache statistics
  const statsRef = useRef({
    memoryHits: 0,
    localStorageHits: 0,
    indexedDBHits: 0,
    misses: 0,
    evictions: 0,
    compressions: 0
  });

  // Initialize IndexedDB
  const initIndexedDB = useCallback(async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('StudyToolCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('priority', 'priority');
        }
      };
    });
  }, []);

  // Calculate data size
  const calculateSize = useCallback((data: any): number => {
    return JSON.stringify(data).length * 2; // Rough estimate
  }, []);

  // Compress data if needed
  const compressData = useCallback((data: any): { data: any; compressed: boolean } => {
    const size = calculateSize(data);
    
    if (size > finalConfig.compressionThreshold) {
      try {
        // Simple compression using JSON stringification optimization
        const compressed = JSON.stringify(data);
        statsRef.current.compressions++;
        return { data: compressed, compressed: true };
      } catch (error) {
        logger.warn('Compression failed:', error);
      }
    }
    
    return { data, compressed: false };
  }, [finalConfig.compressionThreshold, calculateSize]);

  // Decompress data
  const decompressData = useCallback((entry: any): any => {
    if (entry.compressed) {
      try {
        return JSON.parse(entry.data);
      } catch (error) {
        logger.warn('Decompression failed:', error);
        return entry.data;
      }
    }
    return entry.data;
  }, []);

  // Set data in memory cache
  const setMemoryCache = useCallback((
    key: string, 
    data: any, 
    ttl: number = finalConfig.defaultTTL,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const size = calculateSize(data);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      size,
      priority
    };

    memoryCache.current.set(key, entry);
    
    // Check memory limits and evict if necessary
    evictMemoryCache();
  }, [finalConfig.defaultTTL, calculateSize]);

  // Get data from memory cache
  const getMemoryCache = useCallback((key: string): any => {
    const entry = memoryCache.current.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > finalConfig.defaultTTL) {
      memoryCache.current.delete(key);
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    statsRef.current.memoryHits++;
    
    return entry.data;
  }, [finalConfig.defaultTTL]);

  // Evict items from memory cache
  const evictMemoryCache = useCallback(() => {
    const cache = memoryCache.current;
    let totalSize = 0;
    
    // Calculate total size
    for (const entry of cache.values()) {
      totalSize += entry.size;
    }
    
    if (totalSize <= finalConfig.maxMemorySize) return;
    
    // Sort by priority and access patterns
    const entries = Array.from(cache.entries()).sort(([, a], [, b]) => {
      // First by priority
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by access frequency and recency
      const aScore = a.accessCount * (1 / (Date.now() - a.lastAccessed));
      const bScore = b.accessCount * (1 / (Date.now() - b.lastAccessed));
      return aScore - bScore;
    });
    
    // Remove least valuable entries
    let removedSize = 0;
    const targetSize = finalConfig.maxMemorySize * 0.8; // Target 80% of max
    
    while (totalSize - removedSize > targetSize && entries.length > 0) {
      const [key, entry] = entries.shift()!;
      cache.delete(key);
      removedSize += entry.size;
      statsRef.current.evictions++;
    }
    
    logger.debug(`Memory cache evicted ${removedSize} bytes`);
  }, [finalConfig.maxMemorySize]);

  // Set data in localStorage
  const setLocalStorageCache = useCallback((key: string, data: any) => {
    try {
      const { data: processedData, compressed } = compressData(data);
      const entry = {
        data: processedData,
        timestamp: Date.now(),
        compressed
      };
      
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      logger.warn('LocalStorage cache set failed:', error);
    }
  }, [compressData]);

  // Get data from localStorage
  const getLocalStorageCache = useCallback((key: string): any => {
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (!stored) return null;
      
      const entry = JSON.parse(stored);
      
      // Check if expired
      if (Date.now() - entry.timestamp > finalConfig.defaultTTL) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      statsRef.current.localStorageHits++;
      return decompressData(entry);
    } catch (error) {
      logger.warn('LocalStorage cache get failed:', error);
      return null;
    }
  }, [finalConfig.defaultTTL, decompressData]);

  // Set data in IndexedDB
  const setIndexedDBCache = useCallback(async (key: string, data: any) => {
    if (!indexedDBRef.current) return;
    
    try {
      const { data: processedData, compressed } = compressData(data);
      const transaction = indexedDBRef.current.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await store.put({
        key,
        data: processedData,
        timestamp: Date.now(),
        compressed,
        priority: 'medium'
      });
    } catch (error) {
      logger.warn('IndexedDB cache set failed:', error);
    }
  }, [compressData]);

  // Get data from IndexedDB
  const getIndexedDBCache = useCallback(async (key: string): Promise<any> => {
    if (!indexedDBRef.current) return null;
    
    try {
      const transaction = indexedDBRef.current.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const entry = request.result;
          
          if (!entry) {
            resolve(null);
            return;
          }
          
          // Check if expired
          if (Date.now() - entry.timestamp > finalConfig.defaultTTL) {
            // Clean up expired entry
            const deleteTransaction = indexedDBRef.current!.transaction(['cache'], 'readwrite');
            deleteTransaction.objectStore('cache').delete(key);
            resolve(null);
            return;
          }
          
          statsRef.current.indexedDBHits++;
          resolve(decompressData(entry));
        };
        
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      logger.warn('IndexedDB cache get failed:', error);
      return null;
    }
  }, [finalConfig.defaultTTL, decompressData]);

  // Multi-level get (check all levels)
  const get = useCallback(async (key: string): Promise<any> => {
    // Level 1: Memory cache
    let data = getMemoryCache(key);
    if (data !== null) return data;
    
    // Level 2: LocalStorage cache
    data = getLocalStorageCache(key);
    if (data !== null) {
      // Promote to memory cache
      setMemoryCache(key, data);
      return data;
    }
    
    // Level 3: IndexedDB cache
    data = await getIndexedDBCache(key);
    if (data !== null) {
      // Promote to higher levels
      setMemoryCache(key, data);
      setLocalStorageCache(key, data);
      return data;
    }
    
    statsRef.current.misses++;
    return null;
  }, [getMemoryCache, getLocalStorageCache, getIndexedDBCache, setMemoryCache, setLocalStorageCache]);

  // Multi-level set (store in all levels)
  const set = useCallback(async (
    key: string, 
    data: any, 
    options: { 
      ttl?: number; 
      priority?: 'high' | 'medium' | 'low';
      levels?: ('memory' | 'localStorage' | 'indexedDB')[];
    } = {}
  ) => {
    const { 
      ttl = finalConfig.defaultTTL, 
      priority = 'medium',
      levels = ['memory', 'localStorage', 'indexedDB']
    } = options;
    
    // Set in requested levels
    if (levels.includes('memory')) {
      setMemoryCache(key, data, ttl, priority);
    }
    
    if (levels.includes('localStorage')) {
      setLocalStorageCache(key, data);
    }
    
    if (levels.includes('indexedDB')) {
      await setIndexedDBCache(key, data);
    }
  }, [finalConfig.defaultTTL, setMemoryCache, setLocalStorageCache, setIndexedDBCache]);

  // Remove from all levels
  const remove = useCallback(async (key: string) => {
    memoryCache.current.delete(key);
    localStorage.removeItem(`cache_${key}`);
    
    if (indexedDBRef.current) {
      try {
        const transaction = indexedDBRef.current.transaction(['cache'], 'readwrite');
        transaction.objectStore('cache').delete(key);
      } catch (error) {
        logger.warn('IndexedDB cache remove failed:', error);
      }
    }
  }, []);

  // Clear all caches
  const clear = useCallback(async () => {
    memoryCache.current.clear();
    
    // Clear localStorage cache entries
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear IndexedDB
    if (indexedDBRef.current) {
      try {
        const transaction = indexedDBRef.current.transaction(['cache'], 'readwrite');
        transaction.objectStore('cache').clear();
      } catch (error) {
        logger.warn('IndexedDB cache clear failed:', error);
      }
    }
    
    // Reset stats
    statsRef.current = {
      memoryHits: 0,
      localStorageHits: 0,
      indexedDBHits: 0,
      misses: 0,
      evictions: 0,
      compressions: 0
    };
  }, []);

  // Get cache statistics
  const getStats = useCallback(() => {
    const memorySize = Array.from(memoryCache.current.values())
      .reduce((total, entry) => total + entry.size, 0);
    
    return {
      ...statsRef.current,
      memoryEntries: memoryCache.current.size,
      memorySize,
      hitRate: {
        memory: statsRef.current.memoryHits,
        localStorage: statsRef.current.localStorageHits,
        indexedDB: statsRef.current.indexedDBHits,
        total: statsRef.current.memoryHits + statsRef.current.localStorageHits + statsRef.current.indexedDBHits,
        misses: statsRef.current.misses
      }
    };
  }, []);

  // Initialize IndexedDB on mount
  useEffect(() => {
    initIndexedDB().then(db => {
      indexedDBRef.current = db;
      logger.info('Multi-level cache initialized with IndexedDB');
    }).catch(error => {
      logger.error('Failed to initialize IndexedDB:', error);
    });
    
    return () => {
      if (indexedDBRef.current) {
        indexedDBRef.current.close();
      }
    };
  }, [initIndexedDB]);

  return {
    get,
    set,
    remove,
    clear,
    getStats,
    evictMemoryCache
  };
};
