import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to force query invalidation when filter values change
 * This ensures that React Query cache properly updates when filters are modified
 */
export const useQueryInvalidation = (
  queryKey: (string | unknown)[],
  dependencies: unknown[],
  debounceMs = 100
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 [QUERY INVALIDATION] Dependencies changed:', dependencies);
    
    const timeoutId = setTimeout(() => {
      console.log('🚀 [QUERY INVALIDATION] Invalidating queries with key:', queryKey);
      
      // Invalidate all queries that match the base key pattern
      queryClient.invalidateQueries({ 
        queryKey: queryKey.slice(0, 1), // Use just the base key
        exact: false // Match all variations
      });
      
      // Also refetch active queries to ensure immediate updates
      queryClient.refetchQueries({ 
        queryKey: queryKey.slice(0, 1),
        exact: false,
        type: 'active'
      });
      
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, dependencies);
};