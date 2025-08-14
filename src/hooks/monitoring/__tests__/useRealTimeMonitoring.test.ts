import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealTimeMonitoring } from '@/hooks/monitoring/useRealTimeMonitoring';

// Mock web-vitals
vi.mock('web-vitals', () => ({
  getCLS: vi.fn(),
  getFID: vi.fn(),
  getFCP: vi.fn(),
  getLCP: vi.fn(),
  getTTFB: vi.fn(),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock PerformanceObserver
global.PerformanceObserver = class MockPerformanceObserver {
  static supportedEntryTypes = ['navigation', 'resource'];
  constructor(private callback: any) {}
  observe = vi.fn();
  disconnect = vi.fn();
} as any;

describe('useRealTimeMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('initializes with empty metrics and alerts', () => {
    const { result } = renderHook(() => useRealTimeMonitoring());
    
    expect(result.current.getMetrics()).toEqual([]);
    expect(result.current.getAlerts()).toEqual([]);
  });

  it('collects performance metrics', () => {
    const { result } = renderHook(() => useRealTimeMonitoring());
    
    const metric = {
      name: 'test_metric',
      value: 100,
      timestamp: Date.now(),
      tags: { type: 'test' }
    };

    act(() => {
      result.current.collectMetric(metric);
    });

    const metrics = result.current.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0]).toEqual(metric);
  });

  it('triggers alerts for high metric values', () => {
    const { result } = renderHook(() => useRealTimeMonitoring());
    
    const highPageLoadMetric = {
      name: 'page_load_time',
      value: 5000, // Above 3000ms threshold
      timestamp: Date.now(),
    };

    act(() => {
      result.current.collectMetric(highPageLoadMetric);
    });

    // Check if alert was stored in localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'performance_alerts',
      expect.stringContaining('page_load_time')
    );
  });

  it('adds custom alert rules', () => {
    const { result } = renderHook(() => useRealTimeMonitoring());
    
    const customRule = {
      metric: 'custom_metric',
      threshold: 50,
      operator: 'gt' as const,
      duration: 1,
      severity: 'high' as const
    };

    act(() => {
      result.current.addAlertRule(customRule);
    });

    // Test custom rule triggers alert
    const highCustomMetric = {
      name: 'custom_metric',
      value: 75,
      timestamp: Date.now(),
    };

    act(() => {
      result.current.collectMetric(highCustomMetric);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'performance_alerts',
      expect.stringContaining('custom_metric')
    );
  });

  it('rate limits alerts', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useRealTimeMonitoring());
    
    const highMetric = {
      name: 'page_load_time',
      value: 5000,
      timestamp: Date.now(),
    };

    // First alert should trigger
    act(() => {
      result.current.collectMetric(highMetric);
    });

    const firstCallCount = mockLocalStorage.setItem.mock.calls.length;

    // Second alert within duration should not trigger
    act(() => {
      result.current.collectMetric({
        ...highMetric,
        timestamp: Date.now() + 1000, // 1 second later
      });
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(firstCallCount);

    // Alert after duration should trigger
    act(() => {
      vi.advanceTimersByTime(3 * 60 * 1000); // 3 minutes
      result.current.collectMetric({
        ...highMetric,
        timestamp: Date.now() + 3 * 60 * 1000,
      });
    });

    expect(mockLocalStorage.setItem.mock.calls.length).toBeGreaterThan(firstCallCount);
    
    vi.useRealTimers();
  });

  it('stores metrics in localStorage periodically', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useRealTimeMonitoring());
    
    const metric = {
      name: 'test_metric',
      value: 100,
      timestamp: Date.now(),
    };

    act(() => {
      result.current.collectMetric(metric);
    });

    // Fast-forward 30 seconds to trigger flush
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'performance_metrics',
      expect.stringContaining('test_metric')
    );
    
    vi.useRealTimers();
  });

  it('limits stored metrics to 1000', () => {
    const { result } = renderHook(() => useRealTimeMonitoring());
    
    // Simulate existing metrics in localStorage
    const existingMetrics = Array.from({ length: 999 }, (_, i) => ({
      name: `metric_${i}`,
      value: i,
      timestamp: Date.now() - i * 1000,
    }));
    
    mockLocalStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));

    const newMetric = {
      name: 'new_metric',
      value: 1000,
      timestamp: Date.now(),
    };

    act(() => {
      result.current.collectMetric(newMetric);
    });

    // Should store but maintain limit
    const storedData = JSON.parse(
      mockLocalStorage.setItem.mock.calls
        .find(call => call[0] === 'performance_metrics')?.[1] || '[]'
    );
    
    expect(storedData.length).toBeLessThanOrEqual(1000);
  });
});