import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note } from '@/types/note';

export interface EmptyStateContextType {
  // State
  hasSeenWelcome: boolean;
  showWelcome: boolean;
  
  // Data
  notes: Note[];
  loading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  selectedSubject: string;
  
  // Actions
  onCreateNote?: () => void;
  onImportNote?: () => void;
  onRetry?: () => void;
  dismissWelcome: () => void;
  
  // Computed state
  shouldShowWelcome: boolean;
  shouldShowSubjectEmpty: boolean;
  shouldShowFilteredEmpty: boolean;
  shouldShowGenericEmpty: boolean;
  emptyStateType: 'welcome' | 'subject' | 'filtered' | 'generic' | 'none';
}

const EmptyStateContext = createContext<EmptyStateContextType | undefined>(undefined);

export const useEmptyState = () => {
  const context = useContext(EmptyStateContext);
  if (context === undefined) {
    throw new Error('useEmptyState must be used within an EmptyStateProvider');
  }
  return context;
};

interface EmptyStateProviderProps {
  children: ReactNode;
  notes: Note[];
  loading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  selectedSubject: string;
  onCreateNote?: () => void;
  onImportNote?: () => void;
  onRetry?: () => void;
}

export const EmptyStateProvider = ({
  children,
  notes,
  loading,
  error,
  hasActiveFilters,
  selectedSubject,
  onCreateNote,
  onImportNote,
  onRetry
}: EmptyStateProviderProps) => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Initialize welcome state from localStorage
  useEffect(() => {
    const welcomeSeen = localStorage.getItem('notes-welcome-seen');
    const seen = !!welcomeSeen;
    setHasSeenWelcome(seen);
    
    // Show welcome if user hasn't seen it and conditions are met
    if (!seen && notes.length === 0 && !loading && !error) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [notes.length, loading, error]);

  const dismissWelcome = () => {
    setShowWelcome(false);
    setHasSeenWelcome(true);
    localStorage.setItem('notes-welcome-seen', 'true');
  };

  // Computed empty state conditions with priority
  const shouldShowWelcome = showWelcome && notes.length === 0 && !loading && !error;
  const shouldShowSubjectEmpty = !shouldShowWelcome && notes.length === 0 && !loading && !error && selectedSubject && selectedSubject !== 'all';
  const shouldShowFilteredEmpty = !shouldShowWelcome && !shouldShowSubjectEmpty && notes.length === 0 && !loading && !error && hasActiveFilters;
  const shouldShowGenericEmpty = !shouldShowWelcome && !shouldShowSubjectEmpty && !shouldShowFilteredEmpty && notes.length === 0 && !loading && !error;

  // Determine the empty state type
  let emptyStateType: 'welcome' | 'subject' | 'filtered' | 'generic' | 'none' = 'none';
  if (shouldShowWelcome) emptyStateType = 'welcome';
  else if (shouldShowSubjectEmpty) emptyStateType = 'subject';
  else if (shouldShowFilteredEmpty) emptyStateType = 'filtered';
  else if (shouldShowGenericEmpty) emptyStateType = 'generic';

  const value: EmptyStateContextType = {
    // State
    hasSeenWelcome,
    showWelcome,
    
    // Data
    notes,
    loading,
    error,
    hasActiveFilters,
    selectedSubject,
    
    // Actions
    onCreateNote,
    onImportNote,
    onRetry,
    dismissWelcome,
    
    // Computed state
    shouldShowWelcome,
    shouldShowSubjectEmpty,
    shouldShowFilteredEmpty,
    shouldShowGenericEmpty,
    emptyStateType
  };

  return (
    <EmptyStateContext.Provider value={value}>
      {children}
    </EmptyStateContext.Provider>
  );
};