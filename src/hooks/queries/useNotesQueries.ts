// @ts-nocheck

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { fetchNotesFromSupabase, NotesQueryOptions } from '@/contexts/notes/noteUtils';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { toast } from 'sonner';

// Query keys factory for consistent cache management
export const notesQueryKeys = {
  all: ['notes'] as const,
  lists: () => [...notesQueryKeys.all, 'list'] as const,
  list: (options: NotesQueryOptions) => [...notesQueryKeys.lists(), options] as const,
  details: () => [...notesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...notesQueryKeys.details(), id] as const,
};

// Main notes query hook with React Query
export const useNotesQuery = (options: NotesQueryOptions = {}) => {
  return useQuery({
    queryKey: notesQueryKeys.list(options),
    queryFn: () => fetchNotesFromSupabase(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Infinite query for pagination
export const useNotesInfiniteQuery = (options: Omit<NotesQueryOptions, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: [...notesQueryKeys.lists(), 'infinite', options],
    queryFn: ({ pageParam = 1 }) => 
      fetchNotesFromSupabase({ ...options, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Single note query
export const useNoteQuery = (noteId: string | undefined) => {
  return useQuery({
    queryKey: notesQueryKeys.detail(noteId || ''),
    queryFn: async () => {
      if (!noteId) return null;
      
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          user_subjects!notes_subject_id_fkey (
            id,
            name
          ),
          note_tags (
            tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('id', noteId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform to Note interface
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        content: data.content || '',
        date: data.date,
        subject: data.user_subjects?.name || data.subject || 'Uncategorized',
        sourceType: (data.source_type || 'manual') as 'manual' | 'import' | 'scan',
        archived: data.archived || false,
        pinned: data.pinned || false,
        subject_id: data.subject_id,
        tags: data.note_tags?.map(nt => nt.tags).filter(Boolean) || []
      } as Note;
    },
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
