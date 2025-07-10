import React from 'react';
import { EmptyStateProvider } from '@/contexts/EmptyStateContext';
import { EmptyStateManager } from './EmptyStateManager';
import { Note } from '@/types/note';

interface NotesEmptyStateRendererProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  selectedSubject: string;
  onCreateNote?: () => void;
  onImportNote?: () => void;
  onRetry?: () => void;
}

/**
 * Notes Empty State Renderer
 * 
 * This is the ONLY component that should be used to render empty states for notes.
 * It wraps the EmptyStateManager with the EmptyStateProvider to provide context.
 * 
 * Usage:
 * - Replace all individual empty state renders with this component
 * - Pass the necessary props and let it handle the rest
 */
export const NotesEmptyStateRenderer = ({
  notes,
  loading,
  error,
  hasActiveFilters,
  selectedSubject,
  onCreateNote,
  onImportNote,
  onRetry
}: NotesEmptyStateRendererProps) => {
  return (
    <EmptyStateProvider
      notes={notes}
      loading={loading}
      error={error}
      hasActiveFilters={hasActiveFilters}
      selectedSubject={selectedSubject}
      onCreateNote={onCreateNote}
      onImportNote={onImportNote}
      onRetry={onRetry}
    >
      <EmptyStateManager />
    </EmptyStateProvider>
  );
};