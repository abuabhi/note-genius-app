import { useState, useEffect, useCallback, useRef } from 'react';
import { useMemoryOptimization } from './useMemoryOptimization';
import { useConnectionOptimization } from './useConnectionOptimization';
import { useQueryOptimization } from './useQueryOptimization';
import { useSecurityValidation } from './useSecurityValidation';

interface ConsolidatedMetrics {
  memory: {
    current: number;
    peak: number;
    cacheSize: number;
  };
  connection: {
    activeConnections: number;
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  };
  query: {
    hits: number;
    misses: number;
    errors: number;
    total: number;
    hitRate: string;
  };
  security: {
    requestCount: number;
    blockedRequests: number;
    suspiciousActivity: string[];
    lastReset: number;
  };
  lastUpdated: number;
}

interface ConsolidatedMonitoringConfig {
  enabled: boolean;
  updateInterval: number; // Much less frequent
  enableLogging: boolean;
}

export const useConsolidatedMonitoring = (config: Partial<ConsolidatedMonitoringConfig> = {}) => {
  const finalConfig: ConsolidatedMonitoringConfig = {
    enabled: process.env.NODE_ENV === 'development',
    updateInterval: 60000, // 1 minute instead of 2-5 seconds
    enableLogging: false, // Reduce console spam
    ...config
  };

  // Use refs to prevent recreating functions that cause dependency issues
  const { getMemoryStats, getCacheSize, performCleanup } = useMemoryOptimization();
  const { getConnectionMetrics, resetMetrics: resetConnectionMetrics } = useConnectionOptimization();
  const { getQueryStats } = useQueryOptimization();
  const { getSecurityMetrics, resetMetrics: resetSecurityMetrics } = useSecurityValidation();
  
  const [metrics, setMetrics] = useState<ConsolidatedMetrics>({
    memory: { current: 0, peak: 0, cacheSize: 0 },
    connection: { activeConnections: 0, totalRequests: 0, averageResponseTime: 0, errorRate: 0 },
    query: { hits: 0, misses: 0, errors: 0, total: 0, hitRate: '0%' },
    security: { requestCount: 0, blockedRequests: 0, suspiciousActivity: [], lastReset: Date.now() },
    lastUpdated: Date.now()
  });

  // Memoize the update function to prevent recreation
  const updateMetrics = useCallback(() => {
    if (!finalConfig.enabled) return;

    try {
      const memoryStats = getMemoryStats();
      const cacheSize = getCacheSize();
      const connectionStats = getConnectionMetrics();
      const queryStats = getQueryStats();
      const securityStats = getSecurityMetrics();

      const newMetrics: ConsolidatedMetrics = {
        memory: {
          current: memoryStats.current,
          peak: memoryStats.peak,
          cacheSize: cacheSize
        },
        connection: connectionStats,
        query: queryStats,
        security: securityStats,
        lastUpdated: Date.now()
      };

      setMetrics(newMetrics);

      if (finalConfig.enableLogging) {
        console.log('📊 Consolidated Metrics:', newMetrics);
      }

      // Trigger automatic cleanup if memory usage is high
      if (memoryStats.current > 100) {
        performCleanup();
      }
    } catch (error) {
      console.error('Error updating consolidated metrics:', error);
    }
  }, [finalConfig.enabled, finalConfig.enableLogging, getMemoryStats, getCacheSize, getConnectionMetrics, getQueryStats, getSecurityMetrics, performCleanup]);

  // Single interval for all monitoring
  useEffect(() => {
    if (!finalConfig.enabled) return;

    // Initial update
    updateMetrics();

    const interval = setInterval(updateMetrics, finalConfig.updateInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [finalConfig.enabled, finalConfig.updateInterval, updateMetrics]);

  const resetAllMetrics = useCallback(() => {
    resetConnectionMetrics();
    resetSecurityMetrics();
    updateMetrics();
  }, [resetConnectionMetrics, resetSecurityMetrics, updateMetrics]);

  const forceUpdate = useCallback(() => {
    updateMetrics();
  }, [updateMetrics]);

  return {
    metrics,
    isEnabled: finalConfig.enabled,
    resetAllMetrics,
    forceUpdate,
    performCleanup
  };
};