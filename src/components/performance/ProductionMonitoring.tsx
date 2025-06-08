
import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const ProductionMonitoring = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Monitor query cache performance
    const monitorQueries = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      const stats = {
        totalQueries: queries.length,
        staleQueries: queries.filter(q => q.isStale()).length,
        activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
        errorQueries: queries.filter(q => q.state.status === 'error').length,
      };

      // Log performance metrics (in production, send to analytics service)
      console.log('Query Cache Stats:', stats);
    };

    const interval = setInterval(monitorQueries, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [queryClient]);

  // Monitor Core Web Vitals
  useEffect(() => {
    if ('web-vital' in window) {
      // @ts-ignore
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);

  return null; // This component doesn't render anything
};
