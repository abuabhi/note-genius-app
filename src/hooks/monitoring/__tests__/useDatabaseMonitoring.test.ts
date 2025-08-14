import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useDatabaseMonitoring } from '@/hooks/monitoring/useDatabaseMonitoring';
import { createMockSupabaseClient } from '@/test/utils/mockSupabase';

// Mock the supabase client
const mockSupabase = createMockSupabaseClient();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
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

  it('starts monitoring and checks database health', async () => {
    // Mock successful database response
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: [{ count: 1 }],
          error: null
        })
      })
    });

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

  it('creates alerts for database connection failures', async () => {
    // Mock database connection failure
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Connection failed' }
        })
      })
    });

    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.health).not.toBeNull();
    });
    
    expect(result.current.health?.error_rate).toBe(100);
    expect(result.current.health?.uptime).toBe(0);
  });

  it('detects orphaned flashcards', async () => {
    // Mock orphaned flashcards response
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'flashcards') {
        return {
          select: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              // Mock orphaned flashcards
              data: [{ id: '1', set_id: 'orphaned' }],
              error: null
            })
          })
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      };
    });

    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    // Wait for integrity check to run
    await vi.advanceTimersByTimeAsync(300000); // 5 minutes
    
    await waitFor(() => {
      expect(result.current.alerts.length).toBeGreaterThan(0);
    });
    
    const orphanAlert = result.current.alerts.find(
      alert => alert.message.includes('orphaned flashcards')
    );
    expect(orphanAlert).toBeDefined();
    expect(orphanAlert?.severity).toBe('medium');
  });

  it('detects slow queries', async () => {
    // Mock slow query by delaying response
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockImplementation(() => 
          new Promise(resolve => 
            setTimeout(() => resolve({ data: [], error: null }), 2500)
          )
        )
      })
    });

    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    // Wait for performance check to run
    await vi.advanceTimersByTimeAsync(120000); // 2 minutes
    
    await waitFor(() => {
      expect(result.current.alerts.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
    
    const slowQueryAlert = result.current.alerts.find(
      alert => alert.type === 'slow_query'
    );
    expect(slowQueryAlert).toBeDefined();
  });

  it('resolves alerts', async () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    // Manually add an alert to test resolution
    const testAlert = {
      id: 'test-alert',
      type: 'error_spike' as const,
      severity: 'medium' as const,
      message: 'Test alert',
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    // This would normally be done internally, but for testing we'll simulate
    // having an alert and then resolving it
    expect(result.current.resolveAlert).toBeDefined();
    
    // The hook should have a method to resolve alerts
    result.current.resolveAlert('test-alert');
  });

  it('stops monitoring when requested', () => {
    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    expect(result.current.isMonitoring).toBe(true);
    
    result.current.stopMonitoring();
    
    expect(result.current.isMonitoring).toBe(false);
  });

  it('handles high connection count alerts', async () => {
    // Mock high connection count in health check
    const healthCheckSpy = vi.spyOn(result.current, 'checkDatabaseHealth')
      .mockResolvedValue({
        connection_count: 45, // Above 40 threshold
        query_performance: { avg_duration: 100, slow_queries: 0 },
        error_rate: 0,
        uptime: 99.9,
        last_check: new Date().toISOString()
      });

    const { result } = renderHook(() => useDatabaseMonitoring(), { wrapper });
    
    // Trigger health check
    await vi.advanceTimersByTimeAsync(60000); // 1 minute
    
    await waitFor(() => {
      const highConnAlert = result.current.alerts.find(
        alert => alert.type === 'high_connections'
      );
      expect(highConnAlert).toBeDefined();
    });
    
    healthCheckSpy.mockRestore();
  });
});