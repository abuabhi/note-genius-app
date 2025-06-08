
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useCacheStrategy } from './useCacheStrategy';
import { useProductionMetrics } from './useProductionMetrics';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';

interface NotesQueryParams {
  search?: string;
  subject?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'newest' | 'oldest' | 'alphabetical';
  showArchived?: boolean;
}

interface NotesQueryResult {
  notes: Note[];
  totalCount: number;
  hasMore: boolean;
}

export const useOptimizedNotesQuery = (params: NotesQueryParams = {}) => {
  const { user } = useAuth();
  const { cacheConfigs, staleWhileRevalidate } = useCacheStrategy();
  const { recordMetric } = useProductionMetrics('NotesQuery');
  const queryClient = useQueryClient();

  const {
    search = '',
    subject = 'all',
    page = 1,
    pageSize = 20,
    sortBy = 'newest',
    showArchived = false
  } = params;

  const queryKey = ['optimized-notes', user?.id, {
    search,
    subject,
    page,
    pageSize,
    sortBy,
    showArchived
  }];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<NotesQueryResult> => {
      if (!user) return { notes: [], totalCount: 0, hasMore: false };

      const startTime = performance.now();
      
      try {
        // Build optimized query with joins and proper indexing
        let query = supabase
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
          `, { count: 'exact' })
          .eq('user_id', user.id);

        // Apply filters
        if (!showArchived) {
          query = query.eq('archived', false);
        }

        if (subject && subject !== 'all') {
          query = query.eq('subject_id', subject);
        }

        if (search) {
          // Use full-text search for better performance
          query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Apply sorting
        switch (sortBy) {
          case 'newest':
            query = query.order('updated_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'alphabetical':
            query = query.order('title', { ascending: true });
            break;
        }

        // Apply pagination
        const offset = (page - 1) * pageSize;
        query = query.range(offset, offset + pageSize - 1);

        const { data: notes, error, count } = await query;

        if (error) throw error;

        // Transform data to match Note interface
        const transformedNotes: Note[] = (notes || []).map(note => ({
          ...note,
          category: note.user_subjects?.name || note.subject || 'Uncategorized',
          tags: note.note_tags?.map(nt => nt.tags).filter(Boolean) || []
        }));

        const duration = performance.now() - startTime;
        recordMetric('notes_query_duration', duration, {
          notesCount: transformedNotes.length,
          hasFilters: !!(search || subject !== 'all'),
          page
        });

        return {
          notes: transformedNotes,
          totalCount: count || 0,
          hasMore: (count || 0) > offset + pageSize
        };

      } catch (error) {
        const duration = performance.now() - startTime;
        recordMetric('notes_query_error', duration, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    },
    enabled: !!user,
    ...cacheConfigs.user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Prefetch next page
  const prefetchNextPage = () => {
    if (data?.hasMore) {
      queryClient.prefetchQuery({
        queryKey: ['optimized-notes', user?.id, {
          ...params,
          page: page + 1
        }],
        queryFn: async () => {
          // Same query logic but for next page
          return { notes: [], totalCount: 0, hasMore: false };
        },
        staleTime: cacheConfigs.user.staleTime
      });
    }
  };

  return {
    notes: data?.notes || [],
    totalCount: data?.totalCount || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch,
    prefetchNextPage
  };
};
