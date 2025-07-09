import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { toast } from 'sonner';

// Simple query key - no complex factory
const NOTES_QUERY_KEY = ['notes'];

// Fetch function - clean and simple
const fetchNotes = async (options: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  selectedSubject?: string;
  
  sortType?: string;
} = {}): Promise<{ notes: Note[]; totalCount: number; hasMore: boolean }> => {
  const {
    page = 1,
    limit = 20,
    searchTerm = '',
    selectedSubject = '',
    
    sortType = 'recent'
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

  // Apply subject filter - filter by subject_id for efficiency
  if (selectedSubject && selectedSubject !== 'all') {
    // Get user subjects to map name to ID
    const { data: userSubjects } = await supabase
      .from('user_subjects')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('name', selectedSubject)
      .single();
    
    if (userSubjects) {
      query = query.eq('subject_id', userSubjects.id);
    }
  }

  // Always exclude archived (no archive functionality)
  query = query.eq('archived', false);

  // Apply sorting - fix mapping for consistency
  switch (sortType) {
    case 'recent':
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'alphabetical':
      query = query.order('title', { ascending: true });
      break;
    case 'pinned':
      query = query.order('pinned', { ascending: false }).order('created_at', { ascending: false });
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

// Main hook - simple and clean
export const useSimpleNotes = () => {
  const queryClient = useQueryClient();
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  const [sortType, setSortType] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Build query options (memoized for better caching)
  const queryOptions = useMemo(() => ({
    page: currentPage,
    searchTerm,
    selectedSubject,
    sortType
  }), [currentPage, searchTerm, selectedSubject, sortType]);

  // Main query
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...NOTES_QUERY_KEY, queryOptions],
    queryFn: () => fetchNotes(queryOptions),
    staleTime: 1000, // 1 second - fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

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
      
      // Immediate cache update - no complex logic
      queryClient.setQueriesData(
        { queryKey: NOTES_QUERY_KEY },
        (oldData: any) => {
          if (!oldData) return { notes: [newNote], totalCount: 1, hasMore: false };
          
          return {
            ...oldData,
            notes: [newNote, ...oldData.notes],
            totalCount: oldData.totalCount + 1
          };
        }
      );
      
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
      // Update cache immediately
      queryClient.setQueriesData(
        { queryKey: NOTES_QUERY_KEY },
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

      // Optimistically update cache - remove note immediately
      queryClient.setQueriesData(
        { queryKey: NOTES_QUERY_KEY },
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

  // Filter operations
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSortType('newest');
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = Boolean(
    searchTerm || 
    (selectedSubject && selectedSubject !== 'all')
  );

  const activeFilterCount = [
    Boolean(searchTerm),
    Boolean(selectedSubject && selectedSubject !== 'all')
  ].filter(Boolean).length;

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
    loadMore: () => setCurrentPage(prev => prev + 1),
    
    // Filters
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    
    sortType,
    setSortType,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
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