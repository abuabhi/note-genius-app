import { QueryClient } from '@tanstack/react-query';
import { vi, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock handlers for common hooks
export const mockSupabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
});

// Query client utilities
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Mock auth context
export const createMockAuthContext = (user: any = null, loading = false) => ({
  user,
  loading,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
});

// Mock router
export const createMockRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
});

// Form helpers
export const fillFormField = async (user: any, label: string, value: string) => {
  const field = await user.findByLabelText(label);
  await user.clear(field);
  await user.type(field, value);
};

// Wait utilities
export const waitForLoadingToFinish = async (getByTestId: any) => {
  await waitFor(() => {
    expect(() => getByTestId('loading')).toThrow();
  });
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Mock intersection observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// File upload helpers
export const createMockFile = (name = 'test.txt', type = 'text/plain', content = 'test content') => {
  const file = new File([content], name, { type });
  return file;
};

// Toast helpers
export const expectToastMessage = async (message: string) => {
  await waitFor(() => {
    expect(screen.getByText(message)).toBeInTheDocument();
  });
};

// Error boundary test helper
export const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return React.createElement('div', null, 'No error');
};