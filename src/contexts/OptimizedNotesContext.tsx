import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotesQuery } from '@/hooks/performance/useOptimizedNotesQuery';
import { useEnhancedRetry } from '@/hooks/performance/useEnhancedRetry';
import { useProductionMetrics } from '@/hooks/performance/useProductionMetrics';
import { useAdvancedCache } from '@/hooks/performance/useAdvancedCache';
import { useIntelligentPrefetch } from '@/hooks/performance/useIntelligentPrefetch';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedNotesContextType {
  notes: Note[];
  totalCount: number;
  hasMore: boolean;
  isLoading: boolean;
  error: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  refetch: () => void;
  prefetchNextPage: () => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const OptimizedNotesContext = createContext<OptimizedNotesContextType | undefined>(undefined);

export const OptimizedNotesProvider = ({ children }: { children: ReactNode }) => {
  const { recordMetric } = useProductionMetrics('OptimizedNotesProvider');
  const { executeWithRetry } = useEnhancedRetry({
    maxRetries: 3,
    baseDelay: 1000,
    onRetry: (error, attempt) => {
      recordMetric('notes_operation_retry', attempt, {
        error: error.message
      });
    }
  });

  // Advanced caching hooks
  const { invalidateCache, prefetchRelatedData, warmCache } = useAdvancedCache();
  const { trackBehavior, triggerPrefetch } = useIntelligentPrefetch();

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Use optimized query
  const {
    notes,
    totalCount,
    hasMore,
    isLoading,
    error,
    refetch,
    prefetchNextPage
  } = useOptimizedNotesQuery({
    search: searchTerm,
    subject: selectedSubject,
    page: currentPage,
    pageSize: 20,
    sortBy: sortType as 'newest' | 'oldest' | 'alphabetical',
    showArchived
  });

  // Warm cache on mount
  useEffect(() => {
    warmCache();
  }, [warmCache]);

  // Track user behavior for intelligent prefetching
  const trackSearchBehavior = useCallback((term: string) => {
    trackBehavior('search', { term });
    if (term) {
      triggerPrefetch('search-start', { term });
    }
  }, [trackBehavior, triggerPrefetch]);

  const trackNoteAccess = useCallback((noteId: string) => {
    trackBehavior('note-access', { noteId });
    triggerPrefetch('note-view', { noteId });
    prefetchRelatedData(noteId);
  }, [trackBehavior, triggerPrefetch, prefetchRelatedData]);

  const trackSubjectSelection = useCallback((subject: string) => {
    trackBehavior('subject-select', { subject });
  }, [trackBehavior]);

  // Real database operations with proper error handling
  const addNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    return executeWithRetry(async () => {
      recordMetric('note_add_start', 1);
      
      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          description: noteData.description,
          content: noteData.content,
          date: noteData.date,
          subject: noteData.subject,
          source_type: noteData.sourceType,
          archived: noteData.archived || false,
          pinned: noteData.pinned || false,
          subject_id: noteData.subject_id,
          summary_status: 'pending'
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
        sourceType: data.source_type as 'manual' | 'import' | 'scan',
        archived: data.archived || false,
        pinned: data.pinned || false,
        subject_id: data.subject_id,
        tags: [],
        summary_status: 'pending'
      };
      
      // Smart cache invalidation - only invalidate current query
      invalidateCache('note-created', { noteId: newNote.id });
      
      recordMetric('note_add_success', 1);
      toast.success('Note created successfully');
      refetch();
      
      return newNote;
    }, 'Add note');
  }, [executeWithRetry, recordMetric, refetch, invalidateCache]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>): Promise<void> => {
    return executeWithRetry(async () => {
      recordMetric('note_update_start', 1, { noteId: id });
      
      // Prepare update data
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.subject !== undefined) updateData.subject = updates.subject;
      if (updates.archived !== undefined) updateData.archived = updates.archived;
      if (updates.pinned !== undefined) updateData.pinned = updates.pinned;
      if (updates.subject_id !== undefined) updateData.subject_id = updates.subject_id;

      const { error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      // Smart cache invalidation - only invalidate affected queries
      invalidateCache('note-updated', { noteId: id });
      
      recordMetric('note_update_success', 1, { noteId: id });
      toast.success('Note updated successfully');
      refetch();
    }, 'Update note');
  }, [executeWithRetry, recordMetric, refetch, invalidateCache]);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    return executeWithRetry(async () => {
      recordMetric('note_delete_start', 1, { noteId: id });
      
      const { data, error } = await supabase.functions.invoke('delete-note', {
        body: { noteId: id }
      });

      if (error) throw error;
      
      // Smart cache invalidation
      invalidateCache('note-deleted', { noteId: id });
      
      recordMetric('note_delete_success', 1, { noteId: id });
      toast.success('Note deleted successfully');
      refetch();
    }, 'Delete note');
  }, [executeWithRetry, recordMetric, refetch, invalidateCache]);

  // Enhanced search with behavior tracking - preserves current filters
  const handleSearchChange = useCallback((term: string) => {
    console.log(`🔍 Search change: "${searchTerm}" -> "${term}", preserving subject: ${selectedSubject}, sort: ${sortType}`);
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
    trackSearchBehavior(term);
  }, [trackSearchBehavior, searchTerm, selectedSubject, sortType]);

  // Enhanced subject change with behavior tracking - preserves current filters  
  const handleSubjectChange = useCallback((subject: string) => {
    console.log(`🎯 Subject change: "${selectedSubject}" -> "${subject}", preserving search: "${searchTerm}", sort: ${sortType}`);
    setSelectedSubject(subject);
    setCurrentPage(1);
    trackSubjectSelection(subject);
  }, [trackSubjectSelection, selectedSubject, searchTerm, sortType]);

  // Enhanced sort change - preserves current filters
  const handleSortChange = useCallback((sort: string) => {
    console.log(`🔄 Sort change: "${sortType}" -> "${sort}", preserving subject: ${selectedSubject}, search: "${searchTerm}"`);
    setSortType(sort);
    setCurrentPage(1);
  }, [sortType, selectedSubject, searchTerm]);

  const contextValue = useMemo(() => ({
    notes,
    totalCount,
    hasMore,
    isLoading,
    error,
    searchTerm,
    setSearchTerm: handleSearchChange,
    sortType,
    setSortType: handleSortChange,
    showArchived,
    setShowArchived,
    selectedSubject,
    setSelectedSubject: handleSubjectChange,
    currentPage,
    setCurrentPage,
    refetch,
    prefetchNextPage,
    addNote,
    updateNote,
    deleteNote
  }), [
    notes, totalCount, hasMore, isLoading, error,
    searchTerm, handleSearchChange, sortType, handleSortChange, showArchived,
    selectedSubject, handleSubjectChange, currentPage, refetch, prefetchNextPage,
    addNote, updateNote, deleteNote
  ]);

  return (
    <OptimizedNotesContext.Provider value={contextValue}>
      {children}
    </OptimizedNotesContext.Provider>
  );
};

export const useOptimizedNotes = () => {
  const context = useContext(OptimizedNotesContext);
  if (context === undefined) {
    throw new Error('useOptimizedNotes must be used within an OptimizedNotesProvider');
  }
  return context;
};
