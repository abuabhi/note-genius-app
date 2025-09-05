import React, { createContext, useContext, ReactNode } from 'react';
import { useEmptyStateForm, EmptyStateFormData } from '@/hooks/useEmptyStateForm';
import { Note } from '@/types/note';

type EmptyStateContextType = EmptyStateFormData;

const EmptyStateContext = createContext<EmptyStateContextType | undefined>(undefined);

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
  const emptyStateForm = useEmptyStateForm({
    notes,
    loading,
    error,
    hasActiveFilters,
    selectedSubject,
    onCreateNote,
    onImportNote,
    onRetry
  });

  return (
    <EmptyStateContext.Provider value={emptyStateForm}>
      {children}
    </EmptyStateContext.Provider>
  );
};

export const useEmptyState = () => {
  const context = useContext(EmptyStateContext);
  if (context === undefined) {
    throw new Error('useEmptyState must be used within an EmptyStateProvider');
  }
  return context;
};