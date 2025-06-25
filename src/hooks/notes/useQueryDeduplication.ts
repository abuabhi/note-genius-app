
import { useRef, useCallback } from 'react';

interface QueryState {
  [key: string]: {
    promise: Promise<any>;
    timestamp: number;
  };
}

export const useQueryDeduplication = () => {
  const activeQueries = useRef<QueryState>({});
  const QUERY_TIMEOUT = 10000; // 10 seconds

  const deduplicateQuery = useCallback(async <T>(
    queryKey: string,
    queryFn: () => Promise<T>
  ): Promise<T> => {
    const now = Date.now();
    
    // Clean up old queries
    Object.keys(activeQueries.current).forEach(key => {
      if (now - activeQueries.current[key].timestamp > QUERY_TIMEOUT) {
        delete activeQueries.current[key];
      }
    });

    // Check if query is already in progress
    if (activeQueries.current[queryKey]) {
      console.log('🔄 Deduplicating query:', queryKey);
      return activeQueries.current[queryKey].promise;
    }

    // Execute new query
    const promise = queryFn();
    activeQueries.current[queryKey] = {
      promise,
      timestamp: now
    };

    // Clean up after completion
    promise.finally(() => {
      delete activeQueries.current[queryKey];
    });

    return promise;
  }, []);

  return { deduplicateQuery };
};
