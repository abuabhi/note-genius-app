// Export all performance optimization utilities

export { pConsole, devLog } from './productionConsole';
export { intervalManager, useManagedInterval, useManagedTimeout } from './intervalManager';
export { 
  initializeProductionOptimizations,
  stripConsoleInProduction,
  enableProductionCleanup,
  monitorBundleSize 
} from './buildOptimizations';

// Re-export existing optimizations
export * from '../productionOptimizations';
export * from '../productionLogger';