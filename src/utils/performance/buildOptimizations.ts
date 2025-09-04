// Build-time optimizations for production performance
// This file contains utilities to strip console.log statements and optimize for production

/**
 * Production console.log stripper - to be used in build process
 * This would typically be integrated with Vite/Rollup build plugins
 */
export const stripConsoleInProduction = () => {
  if (process.env.NODE_ENV === 'production') {
    // Override console methods in production
    const originalConsole = { ...console };
    
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    // Keep warn and error for critical issues
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
};

/**
 * Memory cleanup utilities for production
 */
export const enableProductionCleanup = () => {
  if (process.env.NODE_ENV === 'production') {
    // Clean up intervals on page unload
    window.addEventListener('beforeunload', () => {
      // Clear any remaining intervals/timeouts (safer approach)
      try {
        // Clear a reasonable range of potential timer IDs
        for (let i = 0; i < 10000; i++) {
          clearTimeout(i);
          clearInterval(i);
        }
      } catch (e) {
        // Ignore errors during cleanup
      }
    });

    // Aggressive garbage collection hints for production
    if ('gc' in window) {
      setInterval(() => {
        try {
          (window as any).gc();
        } catch (e) {
          // Ignore if GC is not available
        }
      }, 300000); // Every 5 minutes
    }
  }
};

/**
 * Bundle size monitoring - only in development
 */
export const monitorBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('http')) {
        // Estimate size based on script length (rough approximation)
        totalSize += src.length * 100; // Very rough estimate
      }
    });
    
    console.log(`📦 Estimated bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
    
    if (totalSize > 1024 * 1024) { // 1MB
      console.warn('⚠️ Bundle size is large, consider code splitting');
    }
  }
};

/**
 * Initialize all production optimizations
 */
export const initializeProductionOptimizations = () => {
  stripConsoleInProduction();
  enableProductionCleanup();
  monitorBundleSize();
  
  // Additional production optimizations
  if (process.env.NODE_ENV === 'production') {
    // Disable React DevTools
    if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = null;
      (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = null;
    }
    
    // Disable console.trace and other expensive operations
    console.trace = () => {};
    console.time = () => {};
    console.timeEnd = () => {};
    console.group = () => {};
    console.groupEnd = () => {};
    console.groupCollapsed = () => {};
  }
};
