
import React, { createContext, useContext, ReactNode, useState, useMemo } from 'react';

interface NotesUIContextType {
  // Search and filtering
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  
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
  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  // View preferences
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // UI states
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Memoized context value focused only on UI concerns
  const contextValue = useMemo(() => ({
    // Search and filtering
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    showArchived,
    setShowArchived,
    selectedSubject,
    setSelectedSubject,
    
    // View preferences
    viewMode,
    setViewMode,
    
    // UI states
    isFilterMenuOpen,
    setIsFilterMenuOpen,
    selectedNoteId,
    setSelectedNoteId,
  }), [
    searchTerm,
    sortType,
    showArchived,
    selectedSubject,
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
