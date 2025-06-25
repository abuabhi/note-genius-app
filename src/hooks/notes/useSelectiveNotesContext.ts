
import { useNotesData } from '@/contexts/notes/NotesDataContext';
import { useNotesUI } from '@/contexts/notes/NotesUIContext';
import { useNotesOperations } from '@/contexts/notes/NotesOperationsContext';

// Granular hooks for specific concerns - reduces re-renders
export const useNotesDataOnly = () => {
  const { notes, totalCount, loading, error } = useNotesData();
  return { notes, totalCount, loading, error };
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
    setSelectedSubject 
  } = useNotesUI();
  return { 
    searchTerm, 
    setSearchTerm, 
    sortType, 
    setSortType, 
    showArchived, 
    setShowArchived, 
    selectedSubject, 
    setSelectedSubject 
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
  const { isCreating, isUpdating, isDeleting, isPinning } = useNotesOperations();
  return { isCreating, isUpdating, isDeleting, isPinning };
};

// Combined hooks for common use cases
export const useNotesWithFilters = () => {
  const dataContext = useNotesData();
  const uiContext = useNotesUI();
  
  return {
    // Data
    notes: dataContext.notes,
    totalCount: dataContext.totalCount,
    loading: dataContext.loading,
    error: dataContext.error,
    
    // Filters
    searchTerm: uiContext.searchTerm,
    setSearchTerm: uiContext.setSearchTerm,
    sortType: uiContext.sortType,
    setSortType: uiContext.setSortType,
    showArchived: uiContext.showArchived,
    setShowArchived: uiContext.setShowArchived,
    selectedSubject: uiContext.selectedSubject,
    setSelectedSubject: uiContext.setSelectedSubject,
  };
};

export const useNotesWithPagination = () => {
  const dataContext = useNotesData();
  
  return {
    // Data
    notes: dataContext.notes,
    totalCount: dataContext.totalCount,
    loading: dataContext.loading,
    error: dataContext.error,
    
    // Pagination
    hasMore: dataContext.hasMore,
    currentPage: dataContext.currentPage,
    setCurrentPage: dataContext.setCurrentPage,
    loadMore: dataContext.loadMore,
    paginationMode: dataContext.paginationMode,
    setPaginationMode: dataContext.setPaginationMode,
    
    // Data refresh
    refreshNotes: dataContext.refreshNotes,
  };
};
