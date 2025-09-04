// Production-optimized interval and timeout management
// Ensures proper cleanup and reduces memory leaks
import React from 'react';

interface ManagedInterval {
  id: NodeJS.Timeout;
  name: string;
  interval: number;
  createdAt: number;
  cleanup: () => void;
}

interface ManagedTimeout {
  id: NodeJS.Timeout;
  name: string;
  delay: number;
  createdAt: number;
  cleanup: () => void;
}

class IntervalManager {
  private intervals = new Map<string, ManagedInterval>();
  private timeouts = new Map<string, ManagedTimeout>();
  private isProduction = process.env.NODE_ENV === 'production';

  // Create a managed interval with automatic cleanup tracking
  createInterval(
    name: string,
    callback: () => void,
    interval: number,
    options: { immediate?: boolean; production?: boolean } = {}
  ): () => void {
    // In production, use longer intervals unless explicitly overridden
    const actualInterval = this.isProduction && !options.production 
      ? Math.max(interval * 2, 300000) // Minimum 5 minutes in production
      : interval;

    // Run immediately if requested
    if (options.immediate) {
      try {
        callback();
      } catch (error) {
        console.error(`Error in immediate callback for ${name}:`, error);
      }
    }

    const id = setInterval(() => {
      try {
        callback();
      } catch (error) {
        console.error(`Error in interval ${name}:`, error);
      }
    }, actualInterval);

    const cleanup = () => {
      clearInterval(id);
      this.intervals.delete(name);
    };

    const managedInterval: ManagedInterval = {
      id,
      name,
      interval: actualInterval,
      createdAt: Date.now(),
      cleanup
    };

    // Clean up any existing interval with the same name
    if (this.intervals.has(name)) {
      this.intervals.get(name)?.cleanup();
    }

    this.intervals.set(name, managedInterval);
    return cleanup;
  }

  // Create a managed timeout with automatic cleanup tracking
  createTimeout(
    name: string,
    callback: () => void,
    delay: number
  ): () => void {
    const id = setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.error(`Error in timeout ${name}:`, error);
      } finally {
        this.timeouts.delete(name);
      }
    }, delay);

    const cleanup = () => {
      clearTimeout(id);
      this.timeouts.delete(name);
    };

    const managedTimeout: ManagedTimeout = {
      id,
      name,
      delay,
      createdAt: Date.now(),
      cleanup
    };

    // Clean up any existing timeout with the same name
    if (this.timeouts.has(name)) {
      this.timeouts.get(name)?.cleanup();
    }

    this.timeouts.set(name, managedTimeout);
    return cleanup;
  }

  // Clean up a specific interval or timeout
  cleanup(name: string): boolean {
    const interval = this.intervals.get(name);
    const timeout = this.timeouts.get(name);
    
    if (interval) {
      interval.cleanup();
      return true;
    }
    
    if (timeout) {
      timeout.cleanup();
      return true;
    }
    
    return false;
  }

  // Clean up all intervals and timeouts
  cleanupAll(): void {
    this.intervals.forEach(interval => interval.cleanup());
    this.timeouts.forEach(timeout => timeout.cleanup());
    this.intervals.clear();
    this.timeouts.clear();
  }

  // Get current status for debugging
  getStatus() {
    return {
      activeIntervals: Array.from(this.intervals.entries()).map(([name, interval]) => ({
        name,
        interval: interval.interval,
        ageMs: Date.now() - interval.createdAt
      })),
      activeTimeouts: Array.from(this.timeouts.entries()).map(([name, timeout]) => ({
        name,
        delay: timeout.delay,
        ageMs: Date.now() - timeout.createdAt
      })),
      total: this.intervals.size + this.timeouts.size
    };
  }

  // Production-optimized intervals for common use cases
  createHealthCheck(name: string, callback: () => void): () => void {
    const interval = this.isProduction ? 600000 : 300000; // 10min prod, 5min dev
    return this.createInterval(`healthcheck-${name}`, callback, interval, { immediate: true });
  }

  createPerformanceMonitor(name: string, callback: () => void): () => void {
    const interval = this.isProduction ? 600000 : 60000; // 10min prod, 1min dev
    return this.createInterval(`performance-${name}`, callback, interval);
  }

  createDataSync(name: string, callback: () => void): () => void {
    const interval = this.isProduction ? 300000 : 30000; // 5min prod, 30s dev
    return this.createInterval(`datasync-${name}`, callback, interval);
  }
}

// Export singleton instance
export const intervalManager = new IntervalManager();

// React hook for managed intervals with automatic cleanup
export const useManagedInterval = (
  name: string,
  callback: () => void,
  interval: number | null,
  deps: React.DependencyList = []
) => {
  React.useEffect(() => {
    if (interval === null) return;

    const cleanup = intervalManager.createInterval(name, callback, interval);
    return cleanup;
  }, [name, interval, ...deps]);
};

// React hook for managed timeouts with automatic cleanup  
export const useManagedTimeout = (
  name: string,
  callback: () => void,
  delay: number | null,
  deps: React.DependencyList = []
) => {
  React.useEffect(() => {
    if (delay === null) return;

    const cleanup = intervalManager.createTimeout(name, callback, delay);
    return cleanup;
  }, [name, delay, ...deps]);
};