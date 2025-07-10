import { useCallback, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

// ✅ FIXED: More robust query key factory with debugging
const getNotesQueryKey = (filters: { search: string; subject: string; sort: string }) => {
  const key = ['notes', 'simple', filters.search.trim(), filters.subject.trim(), filters.sort.trim()];
  console.log('🔑 [QUERY KEY] Generated:', key);
  return key;
};

interface FetchNotesParams {
  search: string;
  subject: string;
  sort: string;
  pageParam?: number;
}

const NOTES_PER_PAGE = 20;

// Enhanced fetch function with search, subject filter, sorting, and pagination
const fetchNotesPage = async ({ search, subject, sort, pageParam = 0 }: FetchNotesParams): Promise<{ notes: Note[]; totalCount: number; hasMore: boolean; nextCursor?: number }> => {
  console.log('🔍 [SIMPLE NOTES] Fetching notes page:', { search, subject, sort, pageParam });

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  // Step 1: Get subject_id if filtering by subject name
  let subjectId: string | null = null;
  if (subject && subject !== 'all') {
    console.log('🔍 Step 1: Looking up subject_id for:', subject);
    
    const { data: subjectData, error: subjectError } = await supabase
      .from('user_subjects')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('name', subject)
      .maybeSingle();
    
    if (subjectError) {
      console.error('❌ Subject lookup failed:', subjectError);
      throw subjectError;
    }
    
    if (subjectData) {
      subjectId = subjectData.id;
      console.log('✅ Found subject_id:', subjectId);
    } else {
      console.log('⚠️ No subject_id found for subject name:', subject);
      // Continue with query but will return no results
    }
  }

  // Step 2: Query notes with subject_id filter
  let query = supabase
    .from('notes')
    .select(`
      *,
      user_subjects!notes_subject_id_fkey (
        id,
        name
      )
    `, { count: 'exact' })
    .eq('user_id', user.user.id)
    .eq('archived', false); // Only show non-archived notes

  // Apply search filter - case-insensitive title search
  if (search.trim()) {
    query = query.ilike('title', `%${search.trim()}%`);
  }

  // Apply subject filter using subject_id (two-step approach)
  if (subject && subject !== 'all') {
    if (subjectId) {
      console.log('🔍 Step 2: Filtering notes by subject_id:', subjectId);
      query = query.eq('subject_id', subjectId);
    } else {
      // Fallback: try filtering by legacy subject field for backward compatibility
      console.log('🔍 Step 2: Fallback to legacy subject field filter');
      query = query.eq('subject', subject);
    }
  }

  // Apply sorting
  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'alphabetical':
      query = query.order('title', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Add pagination
  const from = pageParam * NOTES_PER_PAGE;
  const to = from + NOTES_PER_PAGE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('❌ [FETCH NOTES] Query failed:', error);
    throw error;
  }

  console.log('📊 [FETCH NOTES] Raw query results:', {
    dataLength: data?.length || 0,
    count,
    from,
    to,
    filters: { search, subject, sort }
  });

  const notes: Note[] = (data || []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    content: item.content || '',
    date: item.date,
    subject: item.user_subjects?.name || item.subject || 'Uncategorized',
    sourceType: (item.source_type || 'manual') as 'manual' | 'import' | 'scan',
    archived: item.archived || false,
    pinned: item.pinned || false,
    subject_id: item.subject_id,
    tags: [] // Simplified for now
  }));

  const totalCount = count || 0;
  const hasMore = (from + notes.length) < totalCount;
  const nextCursor = hasMore ? pageParam + 1 : undefined;

  console.log('✅ [SIMPLE NOTES] Fetched notes page:', {
    notesCount: notes.length,
    totalCount,
    hasMore,
    nextCursor,
    appliedFilters: { search, subject, sort }
  });

  return { notes, totalCount, hasMore, nextCursor };
};

// Main hook with filter state management
export const useSimpleNotes = () => {
  const queryClient = useQueryClient();

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortType, setSortType] = useState('newest');

  // Debounced search for performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Current filter values for query
  const currentFilters = {
    search: debouncedSearch,
    subject: selectedSubject,
    sort: sortType
  };

  // ✅ FIXED: Infinite query with immediate loading and fresh data for filters
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isInitialLoading,
    isFetching
  } = useInfiniteQuery({
    queryKey: getNotesQueryKey(currentFilters),
    queryFn: ({ pageParam = 0 }) => {
      console.log('🚀 [SIMPLE NOTES] Query function called with:', { ...currentFilters, pageParam });
      console.log('🚀 [SIMPLE NOTES] Full query key:', getNotesQueryKey(currentFilters));
      return fetchNotesPage({ ...currentFilters, pageParam });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 0, // ✅ FIX: Immediate fresh data for filters - no stale data allowed
    gcTime: 1000 * 60 * 2, // 2 minutes cache retention  
    refetchOnWindowFocus: false,
    refetchOnMount: 'always', // Always refetch on mount
    refetchInterval: false, // Disable auto refetch
  });

  // ✅ FIX: Add query validation to prevent stale data display
  const isQueryStale = !data || isLoading || isFetching;
  
  // Only flatten and return data if query is fresh and matches current filters
  const notes = (!isQueryStale && data?.pages) ? data.pages.flatMap(page => page.notes) : [];
  const totalCount = (!isQueryStale && data?.pages[0]) ? data.pages[0].totalCount : 0;
  const hasMore = !isQueryStale && (hasNextPage || false);

  // Filter calculations (moved before debug logs)
  const hasActiveFilters = !!(searchTerm || (selectedSubject && selectedSubject !== 'all'));
  const activeFilterCount = [searchTerm, selectedSubject !== 'all'].filter(Boolean).length;

  // ✅ COMPREHENSIVE DEBUG: Log the complete data flow
  console.log('🔥 [SIMPLE NOTES HOOK] === COMPLETE DATA FLOW DEBUG ===');
  console.log('🔥 [FILTERS] Current filters:', currentFilters);
  console.log('🔥 [QUERY KEY] Generated query key:', getNotesQueryKey(currentFilters));
  console.log('🔥 [QUERY STATE] Query loading states:', { isLoading, isInitialLoading, isFetchingNextPage });
  console.log('🔥 [RAW DATA] Pages count:', data?.pages?.length || 0);
  console.log('🔥 [RAW DATA] First page data:', data?.pages?.[0] ? {
    notesCount: data.pages[0].notes.length,
    totalCount: data.pages[0].totalCount,
    hasMore: data.pages[0].hasMore
  } : 'No data');
  console.log('🔥 [PROCESSED] Flattened notes count:', notes.length);
  console.log('🔥 [PROCESSED] Final total count:', totalCount);
  console.log('🔥 [PROCESSED] Notes subjects (first 5):', notes.slice(0, 5).map(n => ({ 
    id: n.id, 
    title: n.title, 
    subject: n.subject 
  })));
  console.log('🔥 [UI STATE] hasActiveFilters:', hasActiveFilters);
  console.log('🔥 [UI STATE] activeFilterCount:', activeFilterCount);
  console.log('🔥 ================================================');

  const clearFilters = useCallback(() => {
    console.log('🧹 [SIMPLE NOTES] Clearing all filters');
    setSearchTerm('');
    setSelectedSubject('all');
    setSortType('newest');
  }, []);

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (noteData: Omit<Note, 'id'>): Promise<Note> => {
      console.log('📝 [SIMPLE NOTES] Creating note:', noteData);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.user.id,
          title: noteData.title,
          description: noteData.description,
          content: noteData.content,
          date: noteData.date,
          subject: noteData.subject,
          subject_id: noteData.subject_id,
          source_type: noteData.sourceType,
          archived: noteData.archived || false,
          pinned: noteData.pinned || false,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newNote: Note = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        content: data.content || '',
        date: data.date,
        subject: data.subject || 'Uncategorized',
        sourceType: (data.source_type || 'manual') as 'manual' | 'import' | 'scan',
        archived: data.archived || false,
        pinned: data.pinned || false,
        subject_id: data.subject_id,
        tags: []
      };

      console.log('✅ [SIMPLE NOTES] Note created:', newNote);
      return newNote;
    },
    onSuccess: (newNote) => {
      console.log('🚀 [SIMPLE NOTES] Adding note to infinite query cache');
      
      // ✅ FIXED: Clear cache and trigger refetch instead of complex cache updates
      console.log('🚀 [SIMPLE NOTES] Note created, clearing cache and refetching');
      queryClient.removeQueries({ queryKey: ['notes'], exact: false });
      
      // The query will automatically refetch due to the new query key
      refetch();
      
      console.log('✅ [SIMPLE NOTES] Infinite query cache updated');
      toast.success('Note created successfully');
    },
    onError: (error) => {
      console.error('❌ [SIMPLE NOTES] Failed to create note:', error);
      toast.error('Failed to create note');
    }
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: updates.title,
          description: updates.description,
          content: updates.content,
          subject: updates.subject,
          subject_id: updates.subject_id,
          archived: updates.archived,
          pinned: updates.pinned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id, updates }) => {
      // ✅ FIXED: Clear cache and trigger refetch for updates
      console.log('🔄 [SIMPLE NOTES] Note updated, clearing cache and refetching');
      queryClient.removeQueries({ queryKey: ['notes'], exact: false });
      refetch();
      
      toast.success('Note updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    }
  });

  // Delete note mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      console.log('🗑️ [SIMPLE NOTES] Deleting note:', noteId);
      
      const { data, error } = await supabase
        .rpc('force_delete_note_optimized', { note_id_param: noteId });

      if (error) throw error;
      if (data === false) throw new Error('Delete failed');
      
      return noteId;
    },
    onMutate: async (noteId: string) => {
      // Cancel outgoing refetches to avoid optimistic update conflicts
      await queryClient.cancelQueries({ queryKey: ['notes'] });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: ['notes'] });

      // Optimistically update infinite query cache - remove note immediately
      queryClient.setQueriesData(
        { queryKey: ['notes'], exact: false },
        (oldData: any) => {
          if (!oldData?.pages) return oldData;
          
          const updatedPages = oldData.pages.map((page: any) => {
            const filteredNotes = page.notes.filter((note: Note) => note.id !== noteId);
            return {
              ...page,
              notes: filteredNotes,
              totalCount: Math.max(0, page.totalCount - 1)
            };
          });
          
          console.log('🔄 [SIMPLE NOTES] Optimistic delete from infinite query');
          
          return {
            ...oldData,
            pages: updatedPages
          };
        }
      );

      // ✅ Clear all notes queries
      queryClient.removeQueries({ queryKey: ['notes'], exact: false });

      return { previousData };
    },
    onSuccess: () => {
      console.log('✅ [SIMPLE NOTES] Delete confirmed by server');
      toast.success('Note deleted successfully');
    },
    onError: (error, noteId, context) => {
      console.error('❌ [SIMPLE NOTES] Delete failed, reverting optimistic update:', error);
      
      // Revert optimistic update
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Failed to delete note');
    }
  });

  // CRUD operations
  const addNote = useCallback(async (noteData: Omit<Note, 'id'>) => {
    try {
      return await createMutation.mutateAsync(noteData);
    } catch (error) {
      console.error('Add note failed:', error);
      return null;
    }
  }, [createMutation]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    await updateMutation.mutateAsync({ id, updates });
  }, [updateMutation]);

  const deleteNote = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const pinNote = useCallback(async (id: string, pinned: boolean) => {
    await updateNote(id, { pinned });
  }, [updateNote]);

  const archiveNote = useCallback(async (id: string, archived: boolean) => {
    await updateNote(id, { archived });
  }, [updateNote]);

  // Load more functionality
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('📄 [SIMPLE NOTES] Loading next page...');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Pagination compatibility
  const currentPage = data?.pages?.length || 1;
  const setCurrentPage = useCallback(() => {}, []); // Deprecated for infinite scroll

  // ✅ FIXED: Enhanced setters with proper cache invalidation
  const updateSelectedSubject = useCallback((subject: string) => {
    console.log('🔄 [SIMPLE NOTES] Subject filter changing:', { from: selectedSubject, to: subject });
    console.log('🔄 [SIMPLE NOTES] Previous query key:', getNotesQueryKey(currentFilters));
    
    setSelectedSubject(subject);
    
    // ✅ Remove ALL existing notes queries from cache immediately
    queryClient.removeQueries({ queryKey: ['notes'], exact: false });
    console.log('🗑️ [SIMPLE NOTES] Removed all notes queries from cache');
    
    // The new query will be triggered automatically by React Query when the queryKey changes
  }, [selectedSubject, queryClient, currentFilters]);

  const updateSearchTerm = useCallback((term: string) => {
    console.log('🔍 [SIMPLE NOTES] Search term changing:', { from: searchTerm, to: term });
    console.log('🔍 [SIMPLE NOTES] Previous query key:', getNotesQueryKey(currentFilters));
    
    setSearchTerm(term);
    
    // ✅ Remove ALL existing notes queries from cache immediately  
    queryClient.removeQueries({ queryKey: ['notes'], exact: false });
    console.log('🗑️ [SIMPLE NOTES] Removed all notes queries from cache');
  }, [searchTerm, queryClient, currentFilters]);

  const updateSortType = useCallback((sort: string) => {
    console.log('🔀 [SIMPLE NOTES] Sort changing:', { from: sortType, to: sort });
    console.log('🔀 [SIMPLE NOTES] Previous query key:', getNotesQueryKey(currentFilters));
    
    setSortType(sort);
    
    // ✅ Remove ALL existing notes queries from cache immediately
    queryClient.removeQueries({ queryKey: ['notes'], exact: false });
    console.log('🗑️ [SIMPLE NOTES] Removed all notes queries from cache');
  }, [sortType, queryClient, currentFilters]);

  return {
    // Data - ✅ FIX: Enhanced loading states to prevent stale data display
    notes,
    totalCount,
    hasMore,
    loading: isLoading || isFetchingNextPage || isFetching, // ✅ Include isFetching for filter changes
    isLoading: isLoading || isFetchingNextPage || isFetching,
    isInitialLoading: isInitialLoading || isFetching, // ✅ Show initial loading during filters
    error: error ? String(error) : null,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil(totalCount / NOTES_PER_PAGE),
    loadMore,
    
    // Filter functionality - now working!
    searchTerm,
    setSearchTerm: updateSearchTerm,
    selectedSubject,
    setSelectedSubject: updateSelectedSubject,
    sortType,
    setSortType: updateSortType,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    isFiltering: isLoading || isFetching, // ✅ More accurate filtering state
    filterError: error ? String(error) : null,
    
    // Operations
    addNote,
    updateNote,
    deleteNote,
    pinNote,
    archiveNote,
    refreshNotes: refetch,
    refetch,
    
    // Operation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPinning: updateMutation.isPending,
    
    // Compatibility
    filteredNotes: notes,
    paginatedNotes: notes,
    paginationMode: 'regular' as const,
    setPaginationMode: () => {}, // No-op for compatibility
    hasNotes: notes.length > 0,
    isEmpty: notes.length === 0,
    state: isLoading ? 'loading' : 'idle'
  };
};