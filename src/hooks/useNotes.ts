import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRequireAuth } from './useRequireAuth';
import { addScanDataToDatabase } from '@/contexts/notes/operations/scanOperations';
import { getOrCreateSubjectId } from '@/utils/subjectHelpers';

// Helper function to map database response to Note interface
const mapDbToNote = (dbNote: any): Note => ({
  ...dbNote,
  sourceType: (dbNote.source_type || 'manual') as 'manual' | 'scan' | 'import' | 'youtube',
  video_metadata: typeof dbNote.video_metadata === 'object' && dbNote.video_metadata !== null 
    ? dbNote.video_metadata as Note['video_metadata']
    : undefined
});

export interface NotesFilters {
  searchTerm: string;
  selectedSubject: string;
  sortType: string;
  showArchived: boolean;
}

export const useNotes = () => {
  const { user, loading: authLoading } = useRequireAuth();
  const queryClient = useQueryClient();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  
  // Simplified query key for better caching
  const queryKey = useMemo(() => [
    'notes',
    user?.id,
    // Only include filters in key if they're active to improve cache hits
    searchTerm || null,
    selectedSubject !== 'all' ? selectedSubject : null,
    sortType !== 'newest' ? sortType : null,
    showArchived || null
  ].filter(Boolean), [user?.id, searchTerm, selectedSubject, sortType, showArchived]);

  // Fetch notes with server-side filtering
  const { data: queryResult, isLoading: queryLoading, error, refetch } = useQuery({
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
      
      // Type the response properly
      const response = data as any;
      
      // Map database fields to Note interface
      if (response?.data) {
        response.data = response.data.map(mapDbToNote);
      }
      
      return response;
    },
    enabled: !!user?.id && !authLoading,
    staleTime: 5000, // 5 seconds - much more responsive for navigation
    gcTime: 30000, // Keep in cache for 30 seconds for back navigation
    refetchOnMount: 'always', // Always refetch when mounting to ensure fresh data
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
      
      console.log('🔄 [useNotes] createNoteMutation called with:', noteData);
      console.log('🔄 [useNotes] User ID:', user.id);
      
      // Validate required fields
      if (!noteData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!noteData.content?.trim()) {
        throw new Error('Content is required');
      }
      if (!noteData.subject?.trim()) {
        throw new Error('Subject is required');
      }
      
      // Get or create subject_id using the helper function
      let subjectId = noteData.subject_id;
      if (!subjectId && noteData.subject) {
        console.log('🔄 [useNotes] Getting/creating subject ID for:', noteData.subject);
        subjectId = await getOrCreateSubjectId(noteData.subject);
        console.log('🔄 [useNotes] Subject ID result:', subjectId);
        
        if (!subjectId) {
          throw new Error('Failed to create or find subject');
        }
      }
      
      // Extract scan data if present
      const scanData = (noteData as any).scanData;
      
      // Prepare clean data for database
      const dbData = {
        user_id: user.id,
        title: noteData.title.trim(),
        description: noteData.description?.trim() || '',
        content: noteData.content.trim(),
        date: noteData.date || new Date().toISOString().split('T')[0],
        subject: noteData.subject.trim(),
        subject_id: subjectId,
        source_type: noteData.sourceType || 'manual',
        archived: noteData.archived || false,
        pinned: noteData.pinned || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 [useNotes] Prepared dbData for insert:', dbData);
      
      const { data, error } = await supabase
        .from('notes')
        .insert(dbData)
        .select()
        .single();

      console.log('🔄 [useNotes] Supabase insert response:', { data, error });

      if (error) {
        console.error('❌ [useNotes] Database insert error:', error);
        throw error;
      }
      
      // If this is a scanned note, save the scan data separately
      if (scanData && data.id) {
        try {
          await addScanDataToDatabase(data.id, scanData);
        } catch (scanError) {
          console.error('Failed to save scan data:', scanError);
          // Don't fail the entire operation if scan data save fails
        }
      }
      
      // Map response back to camelCase
      const mappedNote = mapDbToNote(data);
      console.log('🔄 [useNotes] ✅ Note created successfully:', mappedNote);
      return mappedNote;
    },
    onSuccess: (newNote) => {
      // More targeted invalidation for better performance
      queryClient.invalidateQueries({ 
        queryKey: ['notes'],
        exact: false 
      });
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
      // Map camelCase fields to snake_case for database
      const dbUpdates = { ...updates };
      if ('sourceType' in dbUpdates) {
        (dbUpdates as any).source_type = dbUpdates.sourceType;
        delete (dbUpdates as any).sourceType;
      }
      
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Map response back to camelCase
      return mapDbToNote(data);
    },
    onSuccess: () => {
      // More targeted invalidation for better performance
      queryClient.invalidateQueries({ 
        queryKey: ['notes'],
        exact: false 
      });
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
      // More targeted invalidation for better performance
      queryClient.invalidateQueries({ 
        queryKey: ['notes'],
        exact: false 
      });
      toast.success('Note deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete note');
      console.error('Delete note error:', error);
    }
  });

  // Actions
  const addNote = useCallback(async (noteData: Omit<Note, 'id'>) => {
    console.log('📝 [useNotes] addNote called with:', noteData);
    try {
      const result = await createNoteMutation.mutateAsync(noteData);
      console.log('📝 [useNotes] ✅ createNoteMutation completed with result:', result);
      return result;
    } catch (error) {
      console.error('❌ [useNotes] Add note error:', error);
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
    loading: authLoading || queryLoading, // Combined loading state
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