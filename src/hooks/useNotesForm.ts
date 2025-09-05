import React, { useState, useCallback, useMemo } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotesWithQuery } from '@/hooks/useOptimizedNotesWithQuery';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Consolidated notes hook following the settings pattern
 * Combines all notes state management into a single hook
 */
export const useNotesForm = () => {
  // Simple state management replacing complex state machines
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // View preferences
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // UI states
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  // Operation states
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Filter state for the query hook
  const filterState = useMemo(() => ({
    searchTerm,
    selectedSubject,
    showArchived,
    sortType
  }), [searchTerm, selectedSubject, showArchived, sortType]);

  // Query hook with filter state
  const queryHook = useOptimizedNotesWithQuery(filterState);

  // Enhanced cache synchronization
  React.useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      const isNotesQuery = event.query.queryKey[0] === 'notes';
      const isListQuery = event.query.queryKey.includes('list') || 
                         event.query.queryKey.includes('infinite') ||
                         event.query.queryKey.length >= 2;
      
      const isSuccessfulUpdate = event.type === 'updated' && 
                                event.query.state.status === 'success' &&
                                event.query.state.data;

      if (isNotesQuery && isListQuery && isSuccessfulUpdate) {
        // Cache updated, no need to do anything as React Query handles it
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  // Enhanced refresh function
  const enhancedRefreshNotes = useCallback(async () => {
    await queryHook.refreshNotes();
  }, [queryHook.refreshNotes]);

  // Filter actions
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSortType('newest');
    setShowArchived(false);
    setSelectedSubject('all');
  }, []);

  const resetError = useCallback(() => {
    setOperationError(null);
  }, []);

  // Derived filter states
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || sortType !== 'newest' || showArchived || selectedSubject !== 'all';
  }, [searchTerm, sortType, showArchived, selectedSubject]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm !== '') count++;
    if (sortType !== 'newest') count++;
    if (showArchived) count++;
    if (selectedSubject !== 'all') count++;
    return count;
  }, [searchTerm, sortType, showArchived, selectedSubject]);

  // CRUD operations with error handling
  const operations = useMemo(() => ({
    addNote: async (noteData: Omit<Note, 'id'>) => {
      setOperationInProgress(true);
      setOperationError(null);
      try {
        const result = await queryHook.addNote(noteData);
        setOperationInProgress(false);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
        setOperationError(errorMessage);
        setOperationInProgress(false);
        return null;
      }
    },

    updateNote: async (id: string, updates: Partial<Note>) => {
      setOperationInProgress(true);
      setOperationError(null);
      try {
        await queryHook.updateNote(id, updates);
        setOperationInProgress(false);
        
        // Force immediate refresh if subject was updated
        if (updates.subject || updates.subject_id) {
          await enhancedRefreshNotes();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
        setOperationError(errorMessage);
        setOperationInProgress(false);
        throw error;
      }
    },

    deleteNote: async (id: string) => {
      setOperationInProgress(true);
      setOperationError(null);
      try {
        await queryHook.deleteNote(id);
        setOperationInProgress(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
        setOperationError(errorMessage);
        setOperationInProgress(false);
        throw error;
      }
    },

    pinNote: async (id: string, pinned: boolean) => {
      setOperationInProgress(true);
      setOperationError(null);
      try {
        await queryHook.pinNote(id, pinned);
        setOperationInProgress(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to pin note';
        setOperationError(errorMessage);
        setOperationInProgress(false);
        throw error;
      }
    },

    archiveNote: async (id: string, archived: boolean) => {
      setOperationInProgress(true);
      setOperationError(null);
      try {
        await queryHook.updateNote(id, { archived });
        setOperationInProgress(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to archive note';
        setOperationError(errorMessage);
        setOperationInProgress(false);
        throw error;
      }
    },
  }), [queryHook, enhancedRefreshNotes]);

  return {
    // Core data
    notes: queryHook.notes,
    filteredNotes: queryHook.notes, // Same as notes since filtering is server-side
    paginatedNotes: queryHook.notes, // Same as notes since pagination is server-side
    totalCount: queryHook.totalCount,
    loading: queryHook.loading,
    isLoading: queryHook.loading,
    isInitialLoading: queryHook.loading,
    error: queryHook.error,
    
    // Pagination
    hasMore: queryHook.hasMore,
    currentPage: queryHook.currentPage,
    setCurrentPage: queryHook.setCurrentPage,
    loadMore: queryHook.loadMore,
    
    // Additional properties for compatibility
    refetch: enhancedRefreshNotes,
    
    // Search and filtering
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    showArchived,
    setShowArchived,
    selectedSubject,
    setSelectedSubject,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    isFiltering: false, // Simplified for now
    filterError: null, // Simplified for now
    
    // Legacy pagination (for compatibility)
    totalPages: Math.ceil(queryHook.totalCount / 20),
    
    // Operations
    refreshNotes: enhancedRefreshNotes,
    addNote: operations.addNote,
    updateNote: operations.updateNote,
    deleteNote: operations.deleteNote,
    pinNote: operations.pinNote,
    archiveNote: operations.archiveNote,
    
    // Pagination mode
    paginationMode: queryHook.paginationMode,
    setPaginationMode: queryHook.setPaginationMode,
    
    // Operation states - simplified
    isCreating: queryHook.isCreating,
    isUpdating: queryHook.isUpdating,
    isDeleting: queryHook.isDeleting,
    isPinning: queryHook.isPinning,
    
    // Filter actions
    resetError,
    
    // View preferences
    viewMode,
    setViewMode,
    
    // UI states
    isFilterMenuOpen,
    setIsFilterMenuOpen,
    selectedNoteId,
    setSelectedNoteId,
    
    // Simplified operation states for backward compatibility
    isCreatingNote: () => queryHook.isCreating,
    isUpdatingNote: () => queryHook.isUpdating,
    isDeletingNote: () => queryHook.isDeleting,
    
    // General operation state
    isAnyOperationInProgress: operationInProgress || queryHook.isCreating || queryHook.isUpdating || queryHook.isDeleting,
    activeOperationCount: operationInProgress ? 1 : 0,
    
    // Error handling
    hasOperationError: !!operationError,
    operationError,
    clearOperationError: resetError,
    
    // Simplified operation history for backward compatibility
    recentOperations: [],
    successfulOperationsCount: 0,
    failedOperationsCount: 0,
    
    // Data state
    hasNotes: queryHook.notes.length > 0,
    isEmpty: queryHook.notes.length === 0,
    
    // State for debugging
    state: queryHook.loading ? 'loading' : 'success',
  };
};