
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { config, logger } from '@/config/environment';

interface EnhancedQueryProviderProps {
  children: ReactNode;
}

export const EnhancedQueryProvider = ({ children }: EnhancedQueryProviderProps) => {
  const { isOnline, isSlowConnection } = useNetworkStatus();
  
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          // Environment-specific cache settings
          staleTime: config.cache.defaultStaleTime,
          gcTime: config.cache.defaultCacheTime,
          
          // Network-aware settings
          refetchOnWindowFocus: config.isProduction,
          refetchOnReconnect: true,
          refetchOnMount: true,
          
          // Environment-specific retry strategy
          retry: (failureCount, error) => {
            // Don't retry on 4xx errors except 408, 429
            if (error instanceof Error && 'status' in error) {
              const status = (error as any).status;
              if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
                return false;
              }
            }
            
            const maxRetries = config.api.retryAttempts;
            return failureCount < maxRetries;
          },
          
          // Environment-specific backoff
          retryDelay: (attemptIndex) => {
            const baseDelay = config.api.baseDelay;
            const exponentialDelay = baseDelay * Math.pow(2, attemptIndex);
            const maxDelay = config.api.timeout / 2;
            const jitter = Math.random() * 1000;
            
            return Math.min(exponentialDelay + jitter, maxDelay);
          },
          
          // Network status consideration
          enabled: isOnline,
        },
        mutations: {
          retry: isSlowConnection ? 1 : config.api.retryAttempts,
          retryDelay: isSlowConnection ? 3000 : config.api.baseDelay,
        },
      },
    });

    // Environment-specific cache event listeners
    if (config.isDevelopment || config.isStaging) {
      client.getQueryCache().subscribe((event) => {
        if (event.type === 'added') {
          logger.debug('Query added to cache:', event.query.queryKey);
        } else if (event.type === 'removed') {
          logger.debug('Query removed from cache:', event.query.queryKey);
        } else if (event.type === 'updated') {
          const { query } = event;
          if (query.state.error) {
            logger.error('Query error:', query.queryKey, query.state.error);
          } else if (query.state.data) {
            logger.debug('Query updated:', query.queryKey);
          }
        }
      });
    }

    return client;
  });

  // Adjust query settings based on network status and environment
  useEffect(() => {
    const networkAwareSettings = {
      staleTime: isSlowConnection 
        ? config.cache.defaultStaleTime * 2 
        : config.cache.defaultStaleTime,
      gcTime: isSlowConnection 
        ? config.cache.defaultCacheTime * 2 
        : config.cache.defaultCacheTime,
      enabled: isOnline,
      refetchOnWindowFocus: isOnline && !isSlowConnection && config.isProduction,
    };

    queryClient.setDefaultOptions({
      queries: networkAwareSettings
    });

    logger.info('Query client settings updated:', networkAwareSettings);
  }, [isOnline, isSlowConnection, queryClient]);

  // Environment-specific cache cleanup
  useEffect(() => {
    if (!config.isProduction) return; // Only cleanup in production

    const cleanup = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      // Remove stale queries older than configured cache time
      const cutoffTime = Date.now() - config.cache.defaultCacheTime;
      queries.forEach(query => {
        if (query.state.dataUpdatedAt < cutoffTime && query.getObserversCount() === 0) {
          cache.remove(query);
        }
      });
      
      logger.info('Cache cleanup completed');
    };

    // Run cleanup based on environment
    const cleanupInterval = config.isProduction ? 30 * 60 * 1000 : 15 * 60 * 1000;
    const interval = setInterval(cleanup, cleanupInterval);
    
    return () => clearInterval(interval);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
