
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface EnhancedQueryProviderProps {
  children: ReactNode;
}

export const EnhancedQueryProvider = ({ children }: EnhancedQueryProviderProps) => {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          // Stale-while-revalidate strategy
          staleTime: 2 * 60 * 1000, // 2 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
          
          // Network-aware settings
          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
          refetchOnMount: true,
          
          // Retry strategy based on network
          retry: (failureCount, error) => {
            // Don't retry on 4xx errors except 408, 429
            if (error instanceof Error && 'status' in error) {
              const status = (error as any).status;
              if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
                return false;
              }
            }
            
            // Adjust retry count based on network speed
            const maxRetries = isSlowConnection ? 2 : 3;
            return failureCount < maxRetries;
          },
          
          // Exponential backoff with jitter
          retryDelay: (attemptIndex) => {
            const baseDelay = isSlowConnection ? 2000 : 1000;
            const exponentialDelay = baseDelay * Math.pow(2, attemptIndex);
            const maxDelay = isSlowConnection ? 60000 : 30000;
            const jitter = Math.random() * 1000;
            
            return Math.min(exponentialDelay + jitter, maxDelay);
          },
          
          // Network status consideration
          enabled: isOnline,
        },
        mutations: {
          retry: isSlowConnection ? 1 : 2,
          retryDelay: isSlowConnection ? 3000 : 1000,
        },
      },
    });

    // Cache event listeners for debugging
    client.getQueryCache().subscribe((event) => {
      if (event.type === 'added') {
        console.log('📦 Query added to cache:', event.query.queryKey);
      } else if (event.type === 'removed') {
        console.log('🗑️ Query removed from cache:', event.query.queryKey);
      } else if (event.type === 'updated') {
        const { query } = event;
        if (query.state.error) {
          console.error('❌ Query error:', query.queryKey, query.state.error);
        } else if (query.state.data) {
          console.log('✅ Query updated:', query.queryKey);
        }
      }
    });

    return client;
  });

  // Adjust query settings based on network status
  useEffect(() => {
    queryClient.setDefaultOptions({
      queries: {
        staleTime: isSlowConnection ? 5 * 60 * 1000 : 2 * 60 * 1000, // Longer stale time for slow connections
        gcTime: isSlowConnection ? 30 * 60 * 1000 : 10 * 60 * 1000, // Longer cache time for slow connections
        enabled: isOnline,
        refetchOnWindowFocus: isOnline && !isSlowConnection,
      }
    });
  }, [isOnline, isSlowConnection, queryClient]);

  // Periodic cache cleanup
  useEffect(() => {
    const cleanup = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      // Remove stale queries older than 1 hour
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      queries.forEach(query => {
        if (query.state.dataUpdatedAt < oneHourAgo && query.getObserversCount() === 0) {
          cache.remove(query);
        }
      });
      
      console.log('🧹 Cache cleanup completed');
    };

    // Run cleanup every 15 minutes
    const interval = setInterval(cleanup, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
