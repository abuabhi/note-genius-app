
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { useMemo, useCallback } from 'react';

interface NotesFilterParams {
  search?: string;
  subject?: string;
  showArchived?: boolean;
  sortBy?: 'newest' | 'oldest' | 'alphabetical';
  page?: number;
  pageSize?: number;
}

interface NotesFilterResult {
  notes: Note[];
  totalCount: number;
  hasMore: boolean;
}

// Optimized query key generator for consistent caching
const generateQueryKey = (userId: string, params: NotesFilterParams) => [
  'optimized-notes-filter',
  userId,
  params.search || '',
  params.subject || 'all',
  params.showArchived || false,
  params.sortBy || 'newest',
  params.page || 1,
  params.pageSize || 20
];

export const useOptimizedNotesFilter = (params: NotesFilterParams = {}) => {
  const { user } = useAuth();
  const {
    search = '',
    subject = 'all',
    showArchived = false,
    sortBy = 'newest',
    page = 1,
    pageSize = 20
  } = params;

  // Generate stable query key for optimal caching
  const queryKey = useMemo(() => 
    user ? generateQueryKey(user.id, params) : null,
    [user?.id, search, subject, showArchived, sortBy, page, pageSize]
  );

  // Optimized database query with single request
  const queryFn = useCallback(async (): Promise<NotesFilterResult> => {
    if (!user) return { notes: [], totalCount: 0, hasMore: false };

    console.log('🚀 Optimized filter query:', { subject, search, showArchived });

    const offset = (page - 1) * pageSize;

    // Build optimized query with proper joins and filters
    let query = supabase
      .from('notes')
      .select(`
        id,
        title,
        description,
        content,
        date,
        subject,
        subject_id,
        source_type,
        archived,
        pinned,
        created_at,
        updated_at,
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
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters at database level for optimal performance
    if (!showArchived) {
      query = query.eq('archived', false);
    }

    if (search.trim()) {
      // Use full-text search for better performance
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // OPTIMIZED: Subject filtering with proper relationship handling
    if (subject !== 'all' && subject.trim()) {
      console.log(`🎯 Applying optimized subject filter: "${subject}"`);
      
      // Use a more efficient approach with OR condition
      query = query.or(`subject.eq."${subject}",user_subjects.name.eq."${subject}"`);
    }

    // Apply sorting with pinned priority
    switch (sortBy) {
      case 'newest':
        query = query.order('pinned', { ascending: false })
                     .order('updated_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('pinned', { ascending: false })
                     .order('created_at', { ascending: true });
        break;
      case 'alphabetical':
        query = query.order('pinned', { ascending: false })
                     .order('title', { ascending: true });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data: notes, error, count } = await query;

    if (error) {
      console.error('❌ Optimized filter query error:', error);
      throw error;
    }

    // Transform data efficiently
    const transformedNotes: Note[] = (notes || []).map(note => ({
      id: note.id,
      title: note.title,
      description: note.description || '',
      content: note.content || '',
      date: note.date,
      subject: note.user_subjects?.name || note.subject || 'Uncategorized',
      sourceType: (note.source_type || 'manual') as 'manual' | 'import' | 'scan',
      archived: note.archived || false,
      pinned: note.pinned || false,
      subject_id: note.subject_id,
      tags: note.note_tags?.map(nt => nt.tags).filter(Boolean) || []
    }));

    const totalCount = count || 0;
    const hasMore = totalCount > offset + pageSize;

    console.log(`✅ Optimized filter returned ${transformedNotes.length} notes (${totalCount} total)`);

    return {
      notes: transformedNotes,
      totalCount,
      hasMore
    };
  }, [user, search, subject, showArchived, sortBy, page, pageSize]);

  // Use React Query with optimized caching
  const query = useQuery({
    queryKey,
    queryFn,
    enabled: !!user && !!queryKey,
    staleTime: 2 * 60 * 1000, // 2 minutes - balance between freshness and performance
    gcTime: 5 * 60 * 1000, // 5 minutes cache retention
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  return {
    notes: query.data?.notes || [],
    totalCount: query.data?.totalCount || 0,
    hasMore: query.data?.hasMore || false,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching
  };
};
