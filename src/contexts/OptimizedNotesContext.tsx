
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { NotesContextProvider } from './notes/NotesContextProvider';
import { useNotesData } from './notes/NotesDataContext';
import { useNotesUI } from './notes/NotesUIContext';
import { useNotesOperations } from './notes/NotesOperationsContext';

interface OptimizedNotesContextType {
  // Core data
  notes: Note[];
  filteredNotes: Note[]; // For compatibility
  paginatedNotes: Note[]; // For compatibility
  totalCount: number;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  isInitialLoading: boolean; // From state machine
  error: string | null;
  
  // Pagination
  hasMore: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loadMore: () => void;
  
  // Additional properties for compatibility
  refetch: () => void;
  
  // Enhanced search and filtering with state machine
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  isFiltering: boolean;
  filterError: string | null;
  
  // Legacy pagination (for compatibility)
  totalPages: number;
  
  // Operations
  refreshNotes: () => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  pinNote: (id: string, pinned: boolean) => Promise<void>;
  archiveNote: (id: string, archived: boolean) => Promise<void>;
  
  // New React Query enhanced features
  paginationMode: 'regular' | 'infinite';
  setPaginationMode: (mode: 'regular' | 'infinite') => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPinning: boolean;
}

const OptimizedNotesContext = createContext<OptimizedNotesContextType | undefined>(undefined);

// Inner component that consumes the split contexts and provides backward compatibility
const OptimizedNotesProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const dataContext = useNotesData();
  const uiContext = useNotesUI();
  const operationsContext = useNotesOperations();

  // Enhanced refresh function that invalidates all related caches
  const enhancedRefreshNotes = async () => {
    // Call the original refresh
    await dataContext.refreshNotes();
    
    // Add a small delay to ensure data is fresh
    setTimeout(() => {
      // Refresh completed
    }, 100);
  };

  // Enhanced update function with immediate cache invalidation
  const enhancedUpdateNote = async (id: string, updates: Partial<Note>) => {
    console.log('🔄 Enhanced update note with cache invalidation');
    
    try {
      await operationsContext.updateNote(id, updates);
      
      // Force immediate refresh if subject was updated
      if (updates.subject || updates.subject_id) {
        console.log('📝 Subject updated - forcing immediate refresh');
        await enhancedRefreshNotes();
      }
    } catch (error) {
      console.error('❌ Enhanced update note failed:', error);
      throw error;
    }
  };

  // Memoized context value that combines all split contexts for backward compatibility
  const contextValue = useMemo(() => ({
    // Core data
    notes: dataContext.notes,
    filteredNotes: dataContext.notes, // Same as notes since filtering is server-side
    paginatedNotes: dataContext.notes, // Same as notes since pagination is server-side
    totalCount: dataContext.totalCount,
    loading: dataContext.loading,
    isLoading: dataContext.loading,
    isInitialLoading: dataContext.isInitialLoading,
    error: dataContext.error,
    
    // Pagination
    hasMore: dataContext.hasMore,
    currentPage: dataContext.currentPage,
    setCurrentPage: dataContext.setCurrentPage,
    loadMore: dataContext.loadMore,
    
    // Additional properties for compatibility
    refetch: enhancedRefreshNotes,
    
    // Enhanced search and filtering with state machine
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
    isFiltering: uiContext.isFiltering,
    filterError: uiContext.filterError,
    
    // Legacy pagination (for compatibility)
    totalPages: Math.ceil(dataContext.totalCount / 20),
    
    // Operations with enhanced cache handling
    refreshNotes: enhancedRefreshNotes,
    addNote: operationsContext.addNote,
    updateNote: enhancedUpdateNote,
    deleteNote: operationsContext.deleteNote,
    pinNote: operationsContext.pinNote,
    archiveNote: operationsContext.archiveNote,
    
    // New React Query enhanced features
    paginationMode: dataContext.paginationMode,
    setPaginationMode: dataContext.setPaginationMode,
    isCreating: operationsContext.isCreating,
    isUpdating: operationsContext.isUpdating,
    isDeleting: operationsContext.isDeleting,
    isPinning: operationsContext.isPinning,
  }), [dataContext, uiContext, operationsContext, enhancedRefreshNotes, enhancedUpdateNote]);

  return (
    <OptimizedNotesContext.Provider value={contextValue}>
      {children}
    </OptimizedNotesContext.Provider>
  );
});

OptimizedNotesProviderInner.displayName = 'OptimizedNotesProviderInner';

// Main provider that wraps everything
export const OptimizedNotesProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotesContextProvider>
      <OptimizedNotesProviderInner>
        {children}
      </OptimizedNotesProviderInner>
    </NotesContextProvider>
  );
};

export const useOptimizedNotes = () => {
  const context = useContext(OptimizedNotesContext);
  if (context === undefined) {
    throw new Error('useOptimizedNotes must be used within an OptimizedNotesProvider');
  }
  return context;
};
