
import { useState, useMemo, useCallback } from 'react';
import { useNotesQuery, useNotesInfiniteQuery } from './queries/useNotesQueries';
import { useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation, usePinNoteMutation } from './queries/useNoteOperations';
import { NotesQueryOptions } from '@/contexts/notes/noteUtils';
import { Note } from '@/types/note';

export const useOptimizedNotesWithQuery = () => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortType, setSortType] = useState('newest');
  
  // Pagination mode - can switch between regular and infinite
  const [paginationMode, setPaginationMode] = useState<'regular' | 'infinite'>('infinite');
  const [currentPage, setCurrentPage] = useState(1);

  // Build query options
  const queryOptions: NotesQueryOptions = useMemo(() => ({
    search: searchTerm,
    subject: selectedSubject,
    showArchived,
    sortBy: sortType as any,
    page: currentPage,
    pageSize: 20
  }), [searchTerm, selectedSubject, showArchived, sortType, currentPage]);

  // Choose between regular or infinite query
  const regularQuery = useNotesQuery(queryOptions);
  const infiniteQuery = useNotesInfiniteQuery({
    search: searchTerm,
    subject: selectedSubject,
    showArchived,
    sortBy: sortType as any,
    pageSize: 20
  });

  // Extract data from the appropriate query based on mode
  const { data, isLoading, error, refetch } = paginationMode === 'infinite' ? infiniteQuery : regularQuery;
  
  // Get infinite query specific properties safely
  const fetchNextPage = paginationMode === 'infinite' ? infiniteQuery.fetchNextPage : undefined;
  const hasNextPage = paginationMode === 'infinite' ? infiniteQuery.hasNextPage : false;
  const isFetchingNextPage = paginationMode === 'infinite' ? infiniteQuery.isFetchingNextPage : false;

  // Process data based on query type
  const { notes, totalCount, hasMore } = useMemo(() => {
    if (paginationMode === 'infinite' && infiniteQuery.data) {
      const pages = infiniteQuery.data.pages || [];
      const allNotes = pages.flatMap(page => page.notes);
      const lastPage = pages[pages.length - 1];
      
      return {
        notes: allNotes,
        totalCount: lastPage?.totalCount || 0,
        hasMore: hasNextPage || false
      };
    } else if (paginationMode === 'regular' && regularQuery.data) {
      return {
        notes: regularQuery.data.notes,
        totalCount: regularQuery.data.totalCount,
        hasMore: regularQuery.data.hasMore
      };
    }
    
    return { notes: [], totalCount: 0, hasMore: false };
  }, [data, paginationMode, hasNextPage, infiniteQuery.data, regularQuery.data]);

  // Mutations
  const createNoteMutation = useCreateNoteMutation();
  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  const pinNoteMutation = usePinNoteMutation();

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (paginationMode === 'infinite' && hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    } else if (paginationMode === 'regular' && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationMode, hasNextPage, isFetchingNextPage, fetchNextPage, hasMore]);

  // Reset pagination when filters change
  const resetFilters = useCallback(() => {
    setCurrentPage(1);
    if (paginationMode === 'infinite') {
      // Reset infinite query by refetching
      refetch();
    }
  }, [paginationMode, refetch]);

  // Operation functions with optimistic updates
  const operations = useMemo(() => ({
    addNote: async (noteData: Omit<Note, 'id'>) => {
      try {
        const result = await createNoteMutation.mutateAsync(noteData);
        return result;
      } catch (error) {
        console.error('Failed to create note:', error);
        return null;
      }
    },
    
    updateNote: async (id: string, updates: Partial<Note>) => {
      try {
        await updateNoteMutation.mutateAsync({ id, updates });
      } catch (error) {
        console.error('Failed to update note:', error);
        throw error;
      }
    },
    
    deleteNote: async (id: string) => {
      try {
        await deleteNoteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete note:', error);
        throw error;
      }
    },
    
    pinNote: async (id: string, pinned: boolean) => {
      try {
        await pinNoteMutation.mutateAsync({ id, pinned });
      } catch (error) {
        console.error('Failed to pin note:', error);
        throw error;
      }
    }
  }), [createNoteMutation, updateNoteMutation, deleteNoteMutation, pinNoteMutation]);

  return {
    // Data
    notes,
    totalCount,
    hasMore,
    loading: isLoading || createNoteMutation.isPending,
    error: error?.message || null,
    
    // Filter state
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    showArchived,
    setShowArchived,
    sortType,
    setSortType,
    
    // Pagination
    currentPage,
    setCurrentPage,
    loadMore,
    paginationMode,
    setPaginationMode,
    
    // Actions
    refreshNotes: refetch,
    resetFilters,
    
    // Operations with React Query optimizations
    ...operations,
    
    // Mutation states for UI feedback
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
    isPinning: pinNoteMutation.isPending,
  };
};
