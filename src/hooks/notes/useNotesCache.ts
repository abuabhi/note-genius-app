import { useCallback, useRef, useMemo } from 'react';
import { Note } from '@/types/note';

interface CacheEntry {
  note: Note;
  renderedAt: number;
  lastAccessed: number;
  accessCount: number;
}

interface NotesCache {
  entries: Map<string, CacheEntry>;
  maxSize: number;
  ttl: number; // Time to live in milliseconds
}

interface UseNotesCacheProps {
  maxCacheSize?: number;
  cacheTTL?: number; // Cache time-to-live in minutes
  enableIntelligentPreloading?: boolean;
}

export const useNotesCache = ({
  maxCacheSize = 200,
  cacheTTL = 30,
  enableIntelligentPreloading = true
}: UseNotesCacheProps = {}) => {
  const cache = useRef<NotesCache>({
    entries: new Map(),
    maxSize: maxCacheSize,
    ttl: cacheTTL * 60 * 1000, // Convert to milliseconds
  });

  const stats = useRef({
    hits: 0,
    misses: 0,
    evictions: 0,
    preloadHits: 0,
  });

  // Clean up expired entries
  const cleanupExpired = useCallback(() => {
    const now = Date.now();
    const expiredKeys: string[] = [];

    cache.current.entries.forEach((entry, key) => {
      if (now - entry.renderedAt > cache.current.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      cache.current.entries.delete(key);
    });

    return expiredKeys.length;
  }, []);

  // Evict least recently used entries when cache is full
  const evictLRU = useCallback(() => {
    if (cache.current.entries.size <= cache.current.maxSize) return;

    // Sort by last accessed time and access count
    const entries = Array.from(cache.current.entries.entries())
      .sort((a, b) => {
        // Prioritize by access count first, then by last accessed time
        const aScore = a[1].accessCount * 1000 + a[1].lastAccessed;
        const bScore = b[1].accessCount * 1000 + b[1].lastAccessed;
        return aScore - bScore;
      });

    // Remove the least valuable entries
    const removeCount = cache.current.entries.size - cache.current.maxSize + 1;
    for (let i = 0; i < removeCount && i < entries.length; i++) {
      cache.current.entries.delete(entries[i][0]);
      stats.current.evictions++;
    }
  }, []);

  // Cache a note
  const cacheNote = useCallback((note: Note) => {
    const now = Date.now();
    const existing = cache.current.entries.get(note.id);

    cache.current.entries.set(note.id, {
      note,
      renderedAt: now,
      lastAccessed: now,
      accessCount: existing ? existing.accessCount + 1 : 1,
    });

    // Cleanup and eviction
    cleanupExpired();
    evictLRU();
  }, [cleanupExpired, evictLRU]);

  // Get a note from cache
  const getCachedNote = useCallback((noteId: string): Note | null => {
    const entry = cache.current.entries.get(noteId);
    
    if (!entry) {
      stats.current.misses++;
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.renderedAt > cache.current.ttl) {
      cache.current.entries.delete(noteId);
      stats.current.misses++;
      return null;
    }

    // Update access information
    entry.lastAccessed = now;
    entry.accessCount++;
    stats.current.hits++;

    return entry.note;
  }, []);

  // Check if a note is cached
  const isCached = useCallback((noteId: string): boolean => {
    return cache.current.entries.has(noteId);
  }, []);

  // Preload notes intelligently based on scroll position and user behavior
  const preloadNotes = useCallback((notes: Note[], currentIndex: number, direction: 'up' | 'down' = 'down') => {
    if (!enableIntelligentPreloading) return;

    const preloadCount = 5; // Preload 5 items in the scroll direction
    let startIndex: number;
    let endIndex: number;

    if (direction === 'down') {
      startIndex = currentIndex + 1;
      endIndex = Math.min(currentIndex + preloadCount, notes.length - 1);
    } else {
      startIndex = Math.max(currentIndex - preloadCount, 0);
      endIndex = currentIndex - 1;
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const note = notes[i];
      if (note && !isCached(note.id)) {
        cacheNote(note);
      }
    }
  }, [enableIntelligentPreloading, isCached, cacheNote]);

  // Bulk cache notes
  const bulkCacheNotes = useCallback((notes: Note[]) => {
    notes.forEach(note => cacheNote(note));
  }, [cacheNote]);

  // Clear cache
  const clearCache = useCallback(() => {
    cache.current.entries.clear();
    stats.current = { hits: 0, misses: 0, evictions: 0, preloadHits: 0 };
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const total = stats.current.hits + stats.current.misses;
    const hitRate = total > 0 ? (stats.current.hits / total) * 100 : 0;

    return {
      ...stats.current,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheSize: cache.current.entries.size,
      maxSize: cache.current.maxSize,
      memoryEstimate: cache.current.entries.size * 2, // Rough estimate in KB
    };
  }, []);

  // Optimize cache based on usage patterns
  const optimizeCache = useCallback(() => {
    const now = Date.now();
    const recentThreshold = 5 * 60 * 1000; // 5 minutes
    
    // Boost frequently accessed recent items
    cache.current.entries.forEach((entry, key) => {
      if (now - entry.lastAccessed < recentThreshold && entry.accessCount > 3) {
        // These are hot entries, increase their priority by updating access time
        entry.lastAccessed = now;
      }
    });

    // Clean up and optimize
    const expiredCount = cleanupExpired();
    evictLRU();

    return {
      expiredCount,
      currentSize: cache.current.entries.size,
    };
  }, [cleanupExpired, evictLRU]);

  // Memoized cache interface
  const cacheInterface = useMemo(() => ({
    get: getCachedNote,
    set: cacheNote,
    has: isCached,
    preload: preloadNotes,
    bulkSet: bulkCacheNotes,
    clear: clearCache,
    stats: getCacheStats,
    optimize: optimizeCache,
  }), [
    getCachedNote,
    cacheNote,
    isCached,
    preloadNotes,
    bulkCacheNotes,
    clearCache,
    getCacheStats,
    optimizeCache,
  ]);

  return cacheInterface;
};

export default useNotesCache;