import { vi } from 'vitest';

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockSelect = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockDelete = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockNeq = vi.fn().mockReturnThis();
  const mockGt = vi.fn().mockReturnThis();
  const mockLt = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockReturnThis();
  const mockMaybeSingle = vi.fn().mockReturnThis();

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    neq: mockNeq,
    gt: mockGt,
    lt: mockLt,
    order: mockOrder,
    limit: mockLimit,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
  }));

  const mockAuth = {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    onAuthStateChange: vi.fn(),
  };

  const mockStorage = {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn(),
    })),
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    storage: mockStorage,
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  };
};

// Mock responses
export const mockSupabaseResponses = {
  success: (data: any) => ({ data, error: null }),
  error: (message: string) => ({ data: null, error: { message } }),
  empty: () => ({ data: [], error: null }),
  single: (data: any) => ({ data, error: null }),
};

// Auth mock helpers
export const mockAuthUser = {
  authenticated: {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: { full_name: 'Test User' },
  },
  unauthenticated: null,
};

// Mock the entire supabase module
export const mockSupabaseModule = () => {
  vi.mock('@/integrations/supabase/client', () => ({
    supabase: createMockSupabaseClient(),
  }));
};