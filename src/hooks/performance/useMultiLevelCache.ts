
import { useCallback } from 'react';

interface CacheOptions {
  levels: ('memory' | 'localStorage' | 'sessionStorage')[];
  ttl?: number;
}

export const useMultiLevelCache = () => {
  const memoryCache = new Map<string, { data: any; expires: number }>();

  const set = useCallback((key: string, data: any, options: CacheOptions) => {
    const expires = options.ttl ? Date.now() + options.ttl : Infinity;

    options.levels.forEach(level => {
      switch (level) {
        case 'memory':
          memoryCache.set(key, { data, expires });
          break;
        case 'localStorage':
          try {
            localStorage.setItem(key, JSON.stringify({ data, expires }));
          } catch (error) {
            console.warn('Failed to cache in localStorage:', error);
          }
          break;
        case 'sessionStorage':
          try {
            sessionStorage.setItem(key, JSON.stringify({ data, expires }));
          } catch (error) {
            console.warn('Failed to cache in sessionStorage:', error);
          }
          break;
      }
    });
  }, []);

  const get = useCallback((key: string) => {
    // Try memory cache first
    const memoryItem = memoryCache.get(key);
    if (memoryItem && memoryItem.expires > Date.now()) {
      return memoryItem.data;
    }

    // Try localStorage
    try {
      const localItem = localStorage.getItem(key);
      if (localItem) {
        const parsed = JSON.parse(localItem);
        if (parsed.expires > Date.now()) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    // Try sessionStorage
    try {
      const sessionItem = sessionStorage.getItem(key);
      if (sessionItem) {
        const parsed = JSON.parse(sessionItem);
        if (parsed.expires > Date.now()) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error);
    }

    return null;
  }, []);

  const clear = useCallback((key?: string) => {
    if (key) {
      memoryCache.delete(key);
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } else {
      memoryCache.clear();
      localStorage.clear();
      sessionStorage.clear();
    }
  }, []);

  return {
    set,
    get,
    clear
  };
};
