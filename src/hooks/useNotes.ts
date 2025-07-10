import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRequireAuth } from './useRequireAuth';

export interface NotesFilters {
  searchTerm: string;
  selectedSubject: string;
  sortType: string;
  showArchived: boolean;
}

export const useNotes = () => {
  const { user } = useRequireAuth();
  const queryClient = useQueryClient();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  
  // Query key for caching
  const queryKey = useMemo(() => [
    'notes',
    user?.id,
    searchTerm,
    selectedSubject,
    sortType,
    showArchived
  ], [user?.id, searchTerm, selectedSubject, sortType, showArchived]);

  // Fetch notes with server-side filtering
  const { data: queryResult, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('filter_user_notes', {
        p_user_id: user.id,
        p_search_term: searchTerm,
        p_subject_name: selectedSubject,
        p_show_archived: showArchived,
        p_sort_by: sortType,
        p_page_num: 0,
        p_page_size: 100
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  });

  // Extract data from query result
  const notes = useMemo(() => {
    if (!queryResult || typeof queryResult !== 'object' || !('data' in queryResult)) return [];
    return (queryResult as any).data || [];
  }, [queryResult]);
  
  const totalCount = useMemo(() => {
    if (!queryResult || typeof queryResult !== 'object' || !('total_count' in queryResult)) return 0;
    return (queryResult as any).total_count || 0;
  }, [queryResult]);

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: Omit<Note, 'id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          user_id: user.id,
          source_type: noteData.sourceType || 'manual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
      toast.success('Note created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create note');
      console.error('Create note error:', error);
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
      toast.success('Note updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update note');
      console.error('Update note error:', error);
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
      toast.success('Note deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete note');
      console.error('Delete note error:', error);
    }
  });

  // Actions
  const addNote = useCallback(async (noteData: Omit<Note, 'id'>) => {
    try {
      const result = await createNoteMutation.mutateAsync(noteData);
      return result;
    } catch (error) {
      console.error('Add note error:', error);
      return null;
    }
  }, [createNoteMutation]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      await updateNoteMutation.mutateAsync({ id, updates });
    } catch (error) {
      console.error('Update note error:', error);
    }
  }, [updateNoteMutation]);

  const deleteNote = useCallback(async (id: string) => {
    try {
      await deleteNoteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Delete note error:', error);
    }
  }, [deleteNoteMutation]);

  const pinNote = useCallback(async (id: string, pinned: boolean) => {
    await updateNote(id, { pinned });
  }, [updateNote]);

  const archiveNote = useCallback(async (id: string, archived: boolean) => {
    await updateNote(id, { archived });
  }, [updateNote]);

  // Filter utilities
  const hasActiveFilters = useMemo(() => 
    searchTerm !== '' || selectedSubject !== 'all' || showArchived
  , [searchTerm, selectedSubject, showArchived]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm !== '') count++;
    if (selectedSubject !== 'all') count++;
    if (showArchived) count++;
    return count;
  }, [searchTerm, selectedSubject, showArchived]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSortType('newest');
    setShowArchived(false);
  }, []);

  return {
    // Data
    notes,
    totalCount,
    loading: isLoading,
    error: error?.message || null,
    
    // Filter state
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    sortType,
    setSortType,
    showArchived,
    setShowArchived,
    hasActiveFilters,
    activeFilterCount,
    clearFilters,
    
    // Actions
    addNote,
    updateNote,
    deleteNote,
    pinNote,
    archiveNote,
    refetch,
    
    // Loading states
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
};