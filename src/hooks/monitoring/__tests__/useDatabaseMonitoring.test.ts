import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDatabaseMonitoring } from '@/hooks/monitoring/useDatabaseMonitoring';

// Mock the entire supabase module
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [{ count: 1 }], error: null })),
        not: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDatabaseMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    expect(result.current.health).toBeNull();
    expect(result.current.alerts).toEqual([]);
    expect(result.current.isMonitoring).toBe(false);
  });

  it('starts monitoring automatically', async () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    expect(result.current.isMonitoring).toBe(true);
    
    await waitFor(() => {
      expect(result.current.health).not.toBeNull();
    });
    
    expect(result.current.health).toMatchObject({
      connection_count: expect.any(Number),
      query_performance: {
        avg_duration: expect.any(Number),
        slow_queries: expect.any(Number)
      },
      error_rate: expect.any(Number),
      uptime: expect.any(Number),
      last_check: expect.any(String)
    });
  });

  it('handles database health check', async () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    const health = await result.current.checkDatabaseHealth();
    
    expect(health).toMatchObject({
      connection_count: expect.any(Number),
      query_performance: expect.any(Object),
      error_rate: expect.any(Number),
      uptime: expect.any(Number),
      last_check: expect.any(String)
    });
  });

  it('can resolve alerts', () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    expect(typeof result.current.resolveAlert).toBe('function');
    
    // Test resolving a non-existent alert (should not throw)
    result.current.resolveAlert('test-alert-id');
  });

  it('can stop and start monitoring', () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    expect(result.current.isMonitoring).toBe(true);
    
    result.current.stopMonitoring();
    expect(result.current.isMonitoring).toBe(false);
    
    result.current.startMonitoring();
    expect(result.current.isMonitoring).toBe(true);
  });

  it('provides database integrity check function', async () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    expect(typeof result.current.checkDatabaseIntegrity).toBe('function');
    
    // Should not throw when called
    await expect(result.current.checkDatabaseIntegrity()).resolves.not.toThrow();
  });

  it('can clear resolved alerts', () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    expect(typeof result.current.clearResolvedAlerts).toBe('function');
    
    // Should not throw when called
    result.current.clearResolvedAlerts();
  });

  it('provides separate arrays for active and resolved alerts', () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    expect(Array.isArray(result.current.alerts)).toBe(true);
    expect(Array.isArray(result.current.resolvedAlerts)).toBe(true);
  });
});