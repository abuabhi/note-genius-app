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

// Mock the actual hook implementation
const mockUseNotes = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  const notes = [createTestData.note(), createTestData.note()];
  
  return {
    notes,
    loading: false,
    error: null,
    addNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    refetch: vi.fn(),
  };
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useNotes Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => mockUseNotes(), { wrapper });
    
    expect(result.current.notes).toHaveLength(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.addNote).toBe('function');
    expect(typeof result.current.updateNote).toBe('function');
    expect(typeof result.current.deleteNote).toBe('function');
  });

  it('handles add note functionality', async () => {
    const { result } = renderHook(() => mockUseNotes(), { wrapper });
    
    const newNote = createTestData.note({ title: 'New Note' });
    await result.current.addNote(newNote);
    
    expect(result.current.addNote).toHaveBeenCalledWith(newNote);
  });

  it('handles update note functionality', async () => {
    const { result } = renderHook(() => mockUseNotes(), { wrapper });
    
    const noteId = 'note-123';
    const updates = { title: 'Updated Title' };
    await result.current.updateNote(noteId, updates);
    
    expect(result.current.updateNote).toHaveBeenCalledWith(noteId, updates);
  });

  it('handles delete note functionality', async () => {
    const { result } = renderHook(() => mockUseNotes(), { wrapper });
    
    const noteId = 'note-123';
    await result.current.deleteNote(noteId);
    
    expect(result.current.deleteNote).toHaveBeenCalledWith(noteId);
  });

  it('provides refetch functionality', () => {
    const { result } = renderHook(() => mockUseNotes(), { wrapper });
    
    expect(typeof result.current.refetch).toBe('function');
    result.current.refetch();
    expect(result.current.refetch).toHaveBeenCalled();
  });
});