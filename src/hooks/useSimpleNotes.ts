import { useCallback, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

const buildDefinedNoteUpdatePayload = (updates: Partial<Note>) => {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const assign = (dbColumn: string, value: unknown) => {
    if (value !== undefined) payload[dbColumn] = value;
  };

  assign('title', updates.title);
  assign('description', updates.description);
  assign('content', updates.content);
  assign('subject', updates.subject);
  assign('subject_id', updates.subject_id);
  assign('archived', updates.archived);
  assign('pinned', updates.pinned);

  return payload;
};

// Query key factory
const getNotesQueryKey = (filters: { search: string; subject: string; sort: string }) => {
  return ['notes', 'simple', filters.search.trim(), filters.subject.trim(), filters.sort.trim()];
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
  // Simple notes fetch logging disabled for cleaner console

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  // Step 1: Get subject_id if filtering by subject name
  let subjectId: string | null = null;
  if (subject && subject !== 'all') {
    const { data: subjectData, error: subjectError } = await supabase
      .from('user_subjects')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('name', subject)
      .maybeSingle();
    
    if (subjectError) throw subjectError;
    if (subjectData) subjectId = subjectData.id;
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
      query = query.eq('subject_id', subjectId);
    } else {
      // Fallback: try filtering by legacy subject field for backward compatibility
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

  if (error) throw error;

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
    queryFn: ({ pageParam = 0 }) => fetchNotesPage({ ...currentFilters, pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 2 * 60 * 1000, // 2 minutes - improves performance
    gcTime: 5 * 60 * 1000, // 5 minutes cache retention  
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
  });

  // ✅ FIX: Remove isFetching from validation - allow filtered data to display immediately
  const hasValidData = data && data.pages && data.pages.length > 0;
  
  // Display filtered results immediately when available, only block on actual loading
  const notes = (hasValidData && !isInitialLoading) ? data.pages.flatMap(page => page.notes) : [];
  const totalCount = (hasValidData && !isInitialLoading && data.pages[0]) ? data.pages[0].totalCount : 0;
  const hasMore = hasValidData && !isInitialLoading && (hasNextPage || false);

  // Filter calculations
  const hasActiveFilters = !!(searchTerm || (selectedSubject && selectedSubject !== 'all'));
  const activeFilterCount = [searchTerm, selectedSubject !== 'all'].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSortType('newest');
  }, []);

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (noteData: Omit<Note, 'id'>): Promise<Note> => {
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
      
      return {
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
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['notes'], exact: false });
      refetch();
      toast.success('Note created successfully');
    },
    onError: () => {
      toast.error('Failed to create note');
    }
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(buildDefinedNoteUpdatePayload(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['notes'], exact: false });
      refetch();
      toast.success('Note updated successfully');
    },
    onError: () => {
      toast.error('Failed to update note');
    }
  });

  // Delete note mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { data, error } = await supabase
        .rpc('force_delete_note_optimized', { note_id_param: noteId });

      if (error) throw error;
      if (data === false) throw new Error('Delete failed');
      
      return noteId;
    },
    onMutate: async (noteId: string) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previousData = queryClient.getQueriesData({ queryKey: ['notes'] });

      queryClient.setQueriesData(
        { queryKey: ['notes'], exact: false },
        (oldData: any) => {
          if (!oldData?.pages) return oldData;
          
          const updatedPages = oldData.pages.map((page: any) => ({
            ...page,
            notes: page.notes.filter((note: Note) => note.id !== noteId),
            totalCount: Math.max(0, page.totalCount - 1)
          }));
          
          return { ...oldData, pages: updatedPages };
        }
      );

      queryClient.removeQueries({ queryKey: ['notes'], exact: false });
      return { previousData };
    },
    onSuccess: () => {
      toast.success('Note deleted successfully');
    },
    onError: (error, noteId, context) => {
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
    } catch {
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
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Pagination compatibility
  const currentPage = data?.pages?.length || 1;
  const setCurrentPage = useCallback(() => {}, []);

  // Enhanced setters with proper cache invalidation
  const updateSelectedSubject = useCallback((subject: string) => {
    setSelectedSubject(subject);
    queryClient.removeQueries({ queryKey: ['notes'], exact: false });
  }, [queryClient]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    queryClient.removeQueries({ queryKey: ['notes'], exact: false });
  }, [queryClient]);

  const updateSortType = useCallback((sort: string) => {
    setSortType(sort);
    queryClient.removeQueries({ queryKey: ['notes'], exact: false });
  }, [queryClient]);

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