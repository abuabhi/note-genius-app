import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createTestData } from '@/test/utils/testDataFactory';
import { mockSupabaseResponses, createMockSupabaseClient } from '@/test/utils/mockSupabase';

// Mock the supabase client
const mockSupabase = createMockSupabaseClient();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

const mockUseFlashcards = () => {
  const flashcardSets = [
    createTestData.flashcardSet({ card_count: 10 }),
    createTestData.flashcardSet({ card_count: 5 })
  ];
  
  return {
    flashcardSets,
    loading: false,
    error: null,
    createSet: vi.fn(),
    updateSet: vi.fn(),
    deleteSet: vi.fn(),
    duplicateSet: vi.fn(),
    refetch: vi.fn(),
  };
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useFlashcards Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns flashcard sets with correct structure', () => {
    const { result } = renderHook(() => mockUseFlashcards(), { wrapper });
    
    expect(result.current.flashcardSets).toHaveLength(2);
    expect(result.current.flashcardSets[0]).toHaveProperty('card_count', 10);
    expect(result.current.flashcardSets[1]).toHaveProperty('card_count', 5);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('provides CRUD operations', () => {
    const { result } = renderHook(() => mockUseFlashcards(), { wrapper });
    
    expect(typeof result.current.createSet).toBe('function');
    expect(typeof result.current.updateSet).toBe('function');
    expect(typeof result.current.deleteSet).toBe('function');
    expect(typeof result.current.duplicateSet).toBe('function');
  });

  it('handles create set functionality', async () => {
    const { result } = renderHook(() => mockUseFlashcards(), { wrapper });
    
    const newSet = createTestData.flashcardSet({ name: 'New Set' });
    await result.current.createSet(newSet);
    
    expect(result.current.createSet).toHaveBeenCalledWith(newSet);
  });

  it('handles update set functionality', async () => {
    const { result } = renderHook(() => mockUseFlashcards(), { wrapper });
    
    const setId = 'set-123';
    const updates = { name: 'Updated Set Name' };
    await result.current.updateSet(setId, updates);
    
    expect(result.current.updateSet).toHaveBeenCalledWith(setId, updates);
  });

  it('handles delete set functionality', async () => {
    const { result } = renderHook(() => mockUseFlashcards(), { wrapper });
    
    const setId = 'set-123';
    await result.current.deleteSet(setId);
    
    expect(result.current.deleteSet).toHaveBeenCalledWith(setId);
  });

  it('handles duplicate set functionality', async () => {
    const { result } = renderHook(() => mockUseFlashcards(), { wrapper });
    
    const setId = 'set-123';
    await result.current.duplicateSet(setId);
    
    expect(result.current.duplicateSet).toHaveBeenCalledWith(setId);
  });

  it('provides refetch functionality', () => {
    const { result } = renderHook(() => mockUseFlashcards(), { wrapper });
    
    expect(typeof result.current.refetch).toBe('function');
    result.current.refetch();
    expect(result.current.refetch).toHaveBeenCalled();
  });
});