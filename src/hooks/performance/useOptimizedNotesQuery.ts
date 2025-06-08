
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
  const { cacheConfigs } = useCacheStrategy();
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
        console.log(`🔍 Filtering notes by subject: "${subject}"`);

        // For subject filtering, we need to get the subject_id first, then filter notes
        let finalNotes;
        let totalCount = 0;

        if (subject && subject !== 'all') {
          console.log(`🎯 Applying subject filter for: "${subject}"`);
          
          // First, get the subject_id for the selected subject
          const { data: subjectData, error: subjectError } = await supabase
            .from('user_subjects')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', subject)
            .single();

          if (subjectError) {
            console.error('❌ Error fetching subject:', subjectError);
            throw subjectError;
          }

          if (!subjectData) {
            console.log(`⚠️ No subject found with name: "${subject}"`);
            return { notes: [], totalCount: 0, hasMore: false };
          }

          console.log(`📋 Found subject ID: ${subjectData.id} for subject: "${subject}"`);

          // Now query notes with the subject_id
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
            .eq('user_id', user.id)
            .eq('subject_id', subjectData.id);

          // Apply other filters
          if (!showArchived) {
            query = query.eq('archived', false);
          }

          if (search) {
            query = query.ilike('title', `%${search}%`);
          }

          // Apply sorting with pinned notes first
          switch (sortBy) {
            case 'newest':
              query = query.order('pinned', { ascending: false }).order('updated_at', { ascending: false });
              break;
            case 'oldest':
              query = query.order('pinned', { ascending: false }).order('created_at', { ascending: true });
              break;
            case 'alphabetical':
              query = query.order('pinned', { ascending: false }).order('title', { ascending: true });
              break;
          }

          // Apply pagination
          const offset = (page - 1) * pageSize;
          query = query.range(offset, offset + pageSize - 1);

          const { data: notes, error, count } = await query;

          if (error) {
            console.error('❌ Query error:', error);
            throw error;
          }

          finalNotes = notes || [];
          totalCount = count || 0;
        } else {
          // For "all" subjects, get all notes for the user
          console.log(`📋 Getting all notes for user`);
          
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

          if (search) {
            query = query.ilike('title', `%${search}%`);
          }

          // Apply sorting with pinned notes first
          switch (sortBy) {
            case 'newest':
              query = query.order('pinned', { ascending: false }).order('updated_at', { ascending: false });
              break;
            case 'oldest':
              query = query.order('pinned', { ascending: false }).order('created_at', { ascending: true });
              break;
            case 'alphabetical':
              query = query.order('pinned', { ascending: false }).order('title', { ascending: true });
              break;
          }

          // Apply pagination
          const offset = (page - 1) * pageSize;
          query = query.range(offset, offset + pageSize - 1);

          const { data: notes, error, count } = await query;

          if (error) {
            console.error('❌ Query error:', error);
            throw error;
          }

          finalNotes = notes || [];
          totalCount = count || 0;
        }

        console.log(`✅ Query returned ${finalNotes.length} notes for subject: "${subject}"`);
        
        // Log subject information for debugging
        if (finalNotes.length > 0) {
          const subjectInfo = finalNotes.map(note => ({
            title: note.title,
            subjectFromField: note.subject,
            subjectFromJoin: note.user_subjects?.name,
            subjectId: note.subject_id
          }));
          console.log('📊 Subject debugging info:', subjectInfo);
        }

        // Transform data to match Note interface
        const transformedNotes: Note[] = finalNotes.map(note => ({
          id: note.id,
          title: note.title,
          description: note.description || '',
          content: note.content || '',
          date: note.date,
          // Map from subject field or user_subjects relation, fallback to 'Uncategorized'
          category: note.user_subjects?.name || note.subject || 'Uncategorized',
          sourceType: (note.source_type || 'manual') as 'manual' | 'import' | 'scan',
          archived: note.archived || false,
          pinned: note.pinned || false,
          subject_id: note.subject_id,
          tags: note.note_tags?.map(nt => nt.tags).filter(Boolean) || [],
          summary: note.summary,
          summary_generated_at: note.summary_generated_at,
          summary_status: note.summary_status as 'pending' | 'generating' | 'completed' | 'failed',
          key_points: note.key_points,
          key_points_generated_at: note.key_points_generated_at,
          markdown_content: note.markdown_content,
          markdown_content_generated_at: note.markdown_content_generated_at,
          improved_content: note.improved_content,
          improved_content_generated_at: note.improved_content_generated_at
        }));

        const duration = performance.now() - startTime;
        recordMetric('notes_query_duration', duration, {
          notesCount: transformedNotes.length,
          hasFilters: !!(search || subject !== 'all'),
          page
        });

        const offset = (page - 1) * pageSize;
        return {
          notes: transformedNotes,
          totalCount,
          hasMore: totalCount > offset + pageSize
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
    staleTime: 30 * 1000, // Reduce stale time to 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
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
        staleTime: 30 * 1000
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
