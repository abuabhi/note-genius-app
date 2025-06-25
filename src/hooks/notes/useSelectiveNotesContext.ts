import { useNotesData } from '@/contexts/notes/NotesDataContext';
import { useNotesUI } from '@/contexts/notes/NotesUIContext';
import { useNotesOperations } from '@/contexts/notes/NotesOperationsContext';

// Granular hooks for specific concerns - enhanced with state machine capabilities
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
    isAnyOperationInProgress,
    activeOperationCount,
    hasOperationError,
    operationError,
    clearOperationError,
    recentOperations,
    successfulOperationsCount,
    failedOperationsCount,
  } = useNotesOperations();
  return { 
    isCreating, 
    isUpdating, 
    isDeleting, 
    isPinning, 
    isUpdatingNote, 
    isDeletingNote, 
    isAnyOperationInProgress,
    activeOperationCount,
    hasOperationError,
    operationError,
    clearOperationError,
    recentOperations,
    successfulOperationsCount,
    failedOperationsCount,
  };
};

// Combined hooks for common use cases with enhanced state machine capabilities
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
    
    // Enhanced loading states from data state machine
    isInitialLoading: dataContext.isInitialLoading,
    isBackgroundLoading: dataContext.isBackgroundLoading,
    isFiltering: dataContext.isFiltering,
    
    // Enhanced filters with filter state machine
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
    
    // Enhanced loading states from data state machine
    isInitialLoading: dataContext.isInitialLoading,
    isBackgroundLoading: dataContext.isBackgroundLoading,
    isPaginating: dataContext.isPaginating,
    
    // Pagination with enhanced state machine
    hasMore: dataContext.hasMore,
    currentPage: dataContext.currentPage,
    setCurrentPage: dataContext.setCurrentPage,
    loadMore: dataContext.loadMore,
    paginationMode: dataContext.paginationMode,
    setPaginationMode: dataContext.setPaginationMode,
    
    // Data refresh with enhanced error handling
    refreshNotes: dataContext.refreshNotes,
    
    // Enhanced error handling from data state machine
    hasError: dataContext.hasError,
    canRetry: dataContext.canRetry,
    clearError: dataContext.clearError,
    retry: dataContext.retry,
  };
};

// Enhanced hook for comprehensive state machine information
export const useNotesStateMachineDebug = () => {
  const { state: dataState } = useNotesData();
  const { 
    isAnyOperationInProgress, 
    activeOperationCount,
    hasOperationError,
    operationError,
    recentOperations,
    successfulOperationsCount,
    failedOperationsCount,
  } = useNotesOperations();
  const { isFiltering, hasActiveFilters, activeFilterCount, filterError } = useNotesUI();
  const loadingStates = useNotesLoadingStates();
  const errorState = useNotesErrorState();
  
  return {
    currentDataState: dataState,
    isAnyOperationInProgress,
    activeOperationCount,
    hasOperationError,
    operationError,
    isFiltering,
    hasActiveFilters,
    activeFilterCount,
    filterError,
    loadingStates,
    errorState,
    
    // Enhanced debug information
    stateMachineStatus: {
      data: dataState,
      hasActiveFilters,
      operationsInProgress: isAnyOperationInProgress,
      activeOperationCount,
      errorCount: (errorState.error ? 1 : 0) + (operationError ? 1 : 0) + (filterError ? 1 : 0),
    },
    
    // Operation statistics
    operationStats: {
      recentOperations: recentOperations.slice(0, 5), // Last 5 operations
      successfulOperationsCount,
      failedOperationsCount,
      totalOperations: successfulOperationsCount + failedOperationsCount,
    },
  };
};
