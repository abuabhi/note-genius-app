import React, { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { toast } from 'sonner';
import { useUniversalFilters } from './useUniversalFilters';

// Simple query key - no complex factory
const NOTES_QUERY_KEY = ['notes'];

// Fetch function with pre-loaded subject mapping
const fetchNotes = async (options: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  selectedSubject?: string;
  subjectNameToId?: Map<string, string>;
  sortType?: string;
} = {}): Promise<{ notes: Note[]; totalCount: number; hasMore: boolean }> => {
  const {
    page = 1,
    limit = 20,
    searchTerm = '',
    selectedSubject = '',
    subjectNameToId,
    sortType = 'newest'
  } = options;

  console.log('🔍 [SIMPLE NOTES] Fetching notes with options:', options);

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  let query = supabase
    .from('notes')
    .select(`
      *,
      user_subjects!notes_subject_id_fkey (
        id,
        name
      )
    `, { count: 'exact' })
    .eq('user_id', user.user.id);

  // Apply search filter - use proper text search
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  // Apply subject filter using pre-loaded mapping
  if (selectedSubject && selectedSubject !== 'all' && subjectNameToId) {
    const subjectId = subjectNameToId.get(selectedSubject);
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
  }

  // Always exclude archived (no archive functionality)
  query = query.eq('archived', false);

  // Apply sorting - consistent mapping
  switch (sortType) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'alphabetical':
      query = query.order('title', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

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
  const hasMore = offset + limit < totalCount;

  console.log('✅ [SIMPLE NOTES] Fetched notes:', {
    notesCount: notes.length,
    totalCount,
    hasMore,
    page
  });

  return { notes, totalCount, hasMore };
};

// Main hook - using unified filters
export const useSimpleNotes = () => {
  const queryClient = useQueryClient();
  
  // Use unified filter system with enhanced debugging
  const filters = useUniversalFilters({
    defaultSort: 'newest',
    defaultSubject: 'all',
    debounceMs: 300
  });

  // Log filter changes for debugging
  React.useEffect(() => {
    console.log('🔄 [SIMPLE NOTES] Filter state changed:', {
      search: filters.search,
      debouncedSearch: filters.debouncedSearch,
      subject: filters.subject,
      sort: filters.sort,
      hasActiveFilters: filters.hasActiveFilters
    });
  }, [filters.search, filters.debouncedSearch, filters.subject, filters.sort, filters.hasActiveFilters]);

  // Log filter changes for real-time debugging
  console.log('🎯 [SIMPLE NOTES] Current filter state:', {
    search: filters.search,
    debouncedSearch: filters.debouncedSearch,
    subject: filters.subject,
    sort: filters.sort,
    hasActiveFilters: filters.hasActiveFilters,
    activeFilterCount: filters.activeFilterCount
  });

  // Get user subjects for mapping
  const { data: userSubjects = [] } = useQuery({
    queryKey: ['userSubjects'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('user_subjects')
        .select('id, name')
        .eq('user_id', user.user.id);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create subject name to ID mapping
  const subjectNameToId = useMemo(() => {
    const map = new Map<string, string>();
    userSubjects.forEach(subject => {
      map.set(subject.name, subject.id);
    });
    return map;
  }, [userSubjects]);

  // Build query options (memoized for better caching) with debugging
  const queryOptions = useMemo(() => {
    const options = {
      page: 1, // Always page 1 for simplicity
      searchTerm: filters.debouncedSearch,
      selectedSubject: filters.subject,
      subjectNameToId,
      sortType: filters.sort
    };
    console.log('🎯 [SIMPLE NOTES] Building query options:', options);
    return options;
  }, [filters.debouncedSearch, filters.subject, filters.sort, subjectNameToId]);

  // Main query with enhanced debugging and cache invalidation
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...NOTES_QUERY_KEY, 
      filters.debouncedSearch, 
      filters.subject, 
      filters.sort, 
      'page-1' // Always page 1 for simplicity
    ],
    queryFn: () => {
      console.log('🚀 [SIMPLE NOTES] EXECUTING QUERY with filters:', {
        search: filters.debouncedSearch,
        subject: filters.subject,
        sort: filters.sort
      });
      console.log('🔥 [SIMPLE NOTES] NETWORK REQUEST ABOUT TO BE MADE');
      return fetchNotes(queryOptions);
    },
    staleTime: 0, // Always refetch for immediate filter response
    gcTime: 30 * 1000, // 30 seconds cache time
    refetchOnWindowFocus: false,
    enabled: true, // Force enable the query
  });

  // Log when query data changes
  React.useEffect(() => {
    console.log('📊 [SIMPLE NOTES] Query data updated:', {
      notesCount: data?.notes?.length || 0,
      totalCount: data?.totalCount || 0,
      isLoading,
      error: !!error
    });
  }, [data, isLoading, error]);

  const notes = data?.notes || [];
  const totalCount = data?.totalCount || 0;
  const hasMore = data?.hasMore || false;

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
      console.log('🚀 [SIMPLE NOTES] Adding note to cache immediately');
      
      // Immediate cache update with proper query key matching
      queryClient.setQueriesData(
        { queryKey: NOTES_QUERY_KEY, exact: false },
        (oldData: any) => {
          if (!oldData) return { notes: [newNote], totalCount: 1, hasMore: false };
          
          return {
            ...oldData,
            notes: [newNote, ...oldData.notes],
            totalCount: oldData.totalCount + 1
          };
        }
      );

      // Also invalidate all notes queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      
      console.log('✅ [SIMPLE NOTES] Cache updated - note should appear immediately');
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
      // Update cache immediately with proper query key matching
      queryClient.setQueriesData(
        { queryKey: NOTES_QUERY_KEY, exact: false },
        (oldData: any) => {
          if (!oldData?.notes) return oldData;
          
          return {
            ...oldData,
            notes: oldData.notes.map((note: Note) =>
              note.id === id ? { ...note, ...updates } : note
            )
          };
        }
      );

      // Invalidate to ensure all views are updated
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      
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
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueriesData({ queryKey: NOTES_QUERY_KEY });

      // Optimistically update cache - remove note immediately with proper query key matching
      queryClient.setQueriesData(
        { queryKey: NOTES_QUERY_KEY, exact: false },
        (oldData: any) => {
          if (!oldData?.notes) return oldData;
          
          const filteredNotes = oldData.notes.filter((note: Note) => note.id !== noteId);
          console.log('🔄 [SIMPLE NOTES] Optimistic delete - notes before:', oldData.notes.length, 'after:', filteredNotes.length);
          
          return {
            ...oldData,
            notes: filteredNotes,
            totalCount: Math.max(0, oldData.totalCount - 1)
          };
        }
      );

      // Invalidate all notes queries
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });

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

  // Pagination (simplified)
  const currentPage = 1;
  const setCurrentPage = useCallback(() => {}, []);

  return {
    // Data
    notes,
    totalCount,
    hasMore,
    loading: isLoading,
    isLoading,
    isInitialLoading: isLoading,
    error: error ? String(error) : null,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil(totalCount / 20),
    loadMore: () => {},
    
    // Filters (from unified system)
    searchTerm: filters.search,
    setSearchTerm: filters.setSearch,
    selectedSubject: filters.subject,
    setSelectedSubject: filters.setSubject,
    sortType: filters.sort,
    setSortType: filters.setSort,
    clearFilters: filters.clearFilters,
    hasActiveFilters: filters.hasActiveFilters,
    activeFilterCount: filters.activeFilterCount,
    isFiltering: isLoading,
    filterError: null,
    
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