
import { useState, useCallback, useMemo } from 'react';
import { useOptimizedNotesFilter } from './useOptimizedNotesFilter';
import { useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation } from '../queries/useNoteOperations';
import { Note } from '@/types/note';
import { toast } from 'sonner';

// Selective hooks to minimize re-renders and optimize performance

// Hook for notes data with pagination
export const useNotesWithPagination = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Debounced search to reduce query frequency
  const debouncedSearch = useMemo(() => {
    const timeoutId = setTimeout(() => searchTerm, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filterParams = useMemo(() => ({
    search: searchTerm,
    subject: selectedSubject,
    showArchived,
    sortBy,
    page,
    pageSize: 20
  }), [searchTerm, selectedSubject, showArchived, sortBy, page]);

  const {
    notes,
    totalCount,
    hasMore,
    isLoading,
    error,
    refetch,
    isFetching
  } = useOptimizedNotesFilter(filterParams);

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  // Reset page when filters change
  const updateFilters = useCallback((updates: {
    searchTerm?: string;
    selectedSubject?: string;
    showArchived?: boolean;
    sortBy?: 'newest' | 'oldest' | 'alphabetical';
  }) => {
    setPage(1); // Reset to first page
    if (updates.searchTerm !== undefined) setSearchTerm(updates.searchTerm);
    if (updates.selectedSubject !== undefined) setSelectedSubject(updates.selectedSubject);
    if (updates.showArchived !== undefined) setShowArchived(updates.showArchived);
    if (updates.sortBy !== undefined) setSortBy(updates.sortBy);
  }, []);

  return {
    notes,
    totalCount,
    hasMore,
    loading: isLoading,
    error: error?.message || null,
    loadMore,
    searchTerm,
    selectedSubject,
    showArchived,
    sortBy,
    updateFilters,
    refetch
  };
};

// Hook for filter state only (minimal re-renders)
export const useNotesFiltersOnly = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  return {
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    showArchived,
    setShowArchived,
    sortBy,
    setSortBy
  };
};

// Hook for note operations only (create, update, delete)
export const useNotesOperationsOnly = () => {
  const createNoteMutation = useCreateNoteMutation();
  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();

  const addNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const result = await createNoteMutation.mutateAsync(noteData);
      toast.success('Note created successfully');
      return result;
    } catch (error) {
      console.error('Failed to create note:', error);
      toast.error('Failed to create note');
      return null;
    }
  }, [createNoteMutation]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      await updateNoteMutation.mutateAsync({ id, updates });
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
      throw error;
    }
  }, [updateNoteMutation]);

  const deleteNote = useCallback(async (id: string) => {
    try {
      await deleteNoteMutation.mutateAsync(id);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
      throw error;
    }
  }, [deleteNoteMutation]);

  return {
    addNote,
    updateNote,
    deleteNote,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending
  };
};
