
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useNotesFilterStateMachine } from '@/hooks/notes/useNotesFilterStateMachine';

interface NotesUIContextType {
  // Filter state from state machine
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  
  // Filter state machine actions
  clearFilters: () => void;
  resetError: () => void;
  
  // Filter state machine selectors
  isFiltering: boolean;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  filterError: string | null;
  
  // View preferences
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // UI states
  isFilterMenuOpen: boolean;
  setIsFilterMenuOpen: (open: boolean) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
}

const NotesUIContext = createContext<NotesUIContextType | undefined>(undefined);

const NotesUIProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  // Use the filter state machine
  const filterStateMachine = useNotesFilterStateMachine();
  
  // View preferences (not part of filter state machine)
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  
  // UI states (not part of filter state machine)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = React.useState(false);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);

  // Memoized context value that integrates filter state machine
  const contextValue = useMemo(() => ({
    // Filter state from state machine
    searchTerm: filterStateMachine.searchTerm,
    setSearchTerm: filterStateMachine.actions.setSearchTerm,
    sortType: filterStateMachine.sortType,
    setSortType: filterStateMachine.actions.setSortType,
    showArchived: filterStateMachine.showArchived,
    setShowArchived: filterStateMachine.actions.setShowArchived,
    selectedSubject: filterStateMachine.selectedSubject,
    setSelectedSubject: filterStateMachine.actions.setSelectedSubject,
    
    // Filter state machine actions
    clearFilters: filterStateMachine.actions.clearFilters,
    resetError: filterStateMachine.actions.resetError,
    
    // Filter state machine selectors
    isFiltering: filterStateMachine.isFiltering,
    hasActiveFilters: filterStateMachine.hasActiveFilters,
    activeFilterCount: filterStateMachine.activeFilterCount,
    filterError: filterStateMachine.error,
    
    // View preferences
    viewMode,
    setViewMode,
    
    // UI states
    isFilterMenuOpen,
    setIsFilterMenuOpen,
    selectedNoteId,
    setSelectedNoteId,
  }), [
    filterStateMachine.searchTerm,
    filterStateMachine.actions.setSearchTerm,
    filterStateMachine.sortType,
    filterStateMachine.actions.setSortType,
    filterStateMachine.showArchived,
    filterStateMachine.actions.setShowArchived,
    filterStateMachine.selectedSubject,
    filterStateMachine.actions.setSelectedSubject,
    filterStateMachine.actions.clearFilters,
    filterStateMachine.actions.resetError,
    filterStateMachine.isFiltering,
    filterStateMachine.hasActiveFilters,
    filterStateMachine.activeFilterCount,
    filterStateMachine.error,
    viewMode,
    isFilterMenuOpen,
    selectedNoteId,
  ]);

  return (
    <NotesUIContext.Provider value={contextValue}>
      {children}
    </NotesUIContext.Provider>
  );
});

NotesUIProviderInner.displayName = 'NotesUIProviderInner';

export const NotesUIProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotesUIProviderInner>
      {children}
    </NotesUIProviderInner>
  );
};

export const useNotesUI = () => {
  const context = useContext(NotesUIContext);
  if (context === undefined) {
    throw new Error('useNotesUI must be used within a NotesUIProvider');
  }
  return context;
};
