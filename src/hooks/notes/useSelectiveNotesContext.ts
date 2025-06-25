
import { useNotesData } from '@/contexts/notes/NotesDataContext';
import { useNotesUI } from '@/contexts/notes/NotesUIContext';
import { useNotesOperations } from '@/contexts/notes/NotesOperationsContext';

// Granular hooks for specific concerns - reduces re-renders with state machine enhancements
export const useNotesDataOnly = () => {
  const { notes, totalCount, loading, error, hasNotes, isEmpty } = useNotesData();
  return { notes, totalCount, loading, error, hasNotes, isEmpty };
};

export const useNotesLoadingStates = () => {
  const { 
    loading, 
    isInitialLoading, 
    isBackgroundLoading, 
    isRefreshing, 
    isFiltering, 
    isPaginating 
  } = useNotesData();
  return { 
    loading, 
    isInitialLoading, 
    isBackgroundLoading, 
    isRefreshing, 
    isFiltering, 
    isPaginating 
  };
};

export const useNotesErrorState = () => {
  const { error, hasError, canRetry, clearError, retry } = useNotesData();
  return { error, hasError, canRetry, clearError, retry };
};

export const useNotesPaginationOnly = () => {
  const { hasMore, currentPage, setCurrentPage, loadMore, paginationMode, setPaginationMode } = useNotesData();
  return { hasMore, currentPage, setCurrentPage, loadMore, paginationMode, setPaginationMode };
};

export const useNotesFiltersOnly = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    sortType, 
    setSortType, 
    showArchived, 
    setShowArchived, 
    selectedSubject, 
    setSelectedSubject,
    clearFilters,
    resetError,
    isFiltering,
    hasActiveFilters,
    activeFilterCount,
    filterError
  } = useNotesUI();
  return { 
    searchTerm, 
    setSearchTerm, 
    sortType, 
    setSortType, 
    showArchived, 
    setShowArchived, 
    selectedSubject, 
    setSelectedSubject,
    clearFilters,
    resetError,
    isFiltering,
    hasActiveFilters,
    activeFilterCount,
    filterError
  };
};

export const useNotesViewOnly = () => {
  const { viewMode, setViewMode } = useNotesUI();
  return { viewMode, setViewMode };
};

export const useNotesOperationsOnly = () => {
  const operations = useNotesOperations();
  return operations;
};

export const useNotesOperationStates = () => {
  const { 
    isCreating, 
    isUpdating, 
    isDeleting, 
    isPinning, 
    isUpdatingNote, 
    isDeletingNote, 
    isAnyOperationInProgress 
  } = useNotesOperations();
  return { 
    isCreating, 
    isUpdating, 
    isDeleting, 
    isPinning, 
    isUpdatingNote, 
    isDeletingNote, 
    isAnyOperationInProgress 
  };
};

// Combined hooks for common use cases with state machine enhancements
export const useNotesWithFilters = () => {
  const dataContext = useNotesData();
  const uiContext = useNotesUI();
  
  return {
    // Enhanced data with state machine
    notes: dataContext.notes,
    totalCount: dataContext.totalCount,
    loading: dataContext.loading,
    error: dataContext.error,
    hasNotes: dataContext.hasNotes,
    isEmpty: dataContext.isEmpty,
    
    // Enhanced loading states
    isInitialLoading: dataContext.isInitialLoading,
    isBackgroundLoading: dataContext.isBackgroundLoading,
    isFiltering: dataContext.isFiltering,
    
    // Enhanced filters with state machine
    searchTerm: uiContext.searchTerm,
    setSearchTerm: uiContext.setSearchTerm,
    sortType: uiContext.sortType,
    setSortType: uiContext.setSortType,
    showArchived: uiContext.showArchived,
    setShowArchived: uiContext.setShowArchived,
    selectedSubject: uiContext.selectedSubject,
    setSelectedSubject: uiContext.setSelectedSubject,
    clearFilters: uiContext.clearFilters,
    hasActiveFilters: uiContext.hasActiveFilters,
    activeFilterCount: uiContext.activeFilterCount,
    filterError: uiContext.filterError,
  };
};

export const useNotesWithPagination = () => {
  const dataContext = useNotesData();
  
  return {
    // Enhanced data with state machine
    notes: dataContext.notes,
    totalCount: dataContext.totalCount,
    loading: dataContext.loading,
    error: dataContext.error,
    hasNotes: dataContext.hasNotes,
    isEmpty: dataContext.isEmpty,
    
    // Enhanced loading states
    isInitialLoading: dataContext.isInitialLoading,
    isBackgroundLoading: dataContext.isBackgroundLoading,
    isPaginating: dataContext.isPaginating,
    
    // Pagination
    hasMore: dataContext.hasMore,
    currentPage: dataContext.currentPage,
    setCurrentPage: dataContext.setCurrentPage,
    loadMore: dataContext.loadMore,
    paginationMode: dataContext.paginationMode,
    setPaginationMode: dataContext.setPaginationMode,
    
    // Data refresh with enhanced error handling
    refreshNotes: dataContext.refreshNotes,
    
    // Error handling
    hasError: dataContext.hasError,
    canRetry: dataContext.canRetry,
    clearError: dataContext.clearError,
    retry: dataContext.retry,
  };
};

// New hook for comprehensive state machine information
export const useNotesStateMachineDebug = () => {
  const { state } = useNotesData();
  const { isAnyOperationInProgress } = useNotesOperations();
  const { isFiltering, hasActiveFilters, activeFilterCount, filterError } = useNotesUI();
  const loadingStates = useNotesLoadingStates();
  const errorState = useNotesErrorState();
  
  return {
    currentState: state,
    isAnyOperationInProgress,
    isFiltering,
    hasActiveFilters,
    activeFilterCount,
    filterError,
    loadingStates,
    errorState,
  };
};
