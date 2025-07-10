
import React, { useState, useCallback, useMemo } from 'react';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { useVirtualizationMetrics } from '@/hooks/notes/useVirtualizationMetrics';
import { Note } from '@/types/note';

// Use the simple notes hook instead of complex contexts
import { useSimpleNotes } from '@/hooks/useSimpleNotes';

// New smaller components
import { NotesErrorHandler } from './components/NotesErrorHandler';
import { NotesFiltersSection } from './components/NotesFiltersSection';
import { NotesContentGrid } from './components/NotesContentGrid';
import { NotesLoadMoreSection } from './components/NotesLoadMoreSection';
import { NotesCounter } from './components/NotesCounter';

interface OptimizedNotesContentProps {
  viewMode: 'grid' | 'list';
  onCreateNote?: () => void;
  onImportNote?: () => void;
}

export const OptimizedNotesContent = React.memo(({ viewMode, onCreateNote, onImportNote }: OptimizedNotesContentProps) => {
  // Use the simple notes hook for clean, direct data access
  const {
    notes,
    totalCount,
    loading,
    isInitialLoading,
    hasMore,
    loadMore,
    searchTerm,
    selectedSubject,
    updateNote,
    deleteNote,
    error,
    refetch
  } = useSimpleNotes();

  // Virtualization control with memoized threshold - no UI toggle needed
  const virtualizationThreshold = useMemo(() => 50, []);
  const shouldVirtualize = useMemo(() => 
    notes.length > virtualizationThreshold, 
    [notes.length, virtualizationThreshold]
  );

  // Performance metrics
  const { metrics } = useVirtualizationMetrics({
    totalItems: notes.length,
    isVirtualized: shouldVirtualize,
    debugMode: process.env.NODE_ENV === 'development',
  });

  // Memoized computed values
  const isFiltered = useMemo(() => 
    !!(searchTerm || selectedSubject !== 'all'), 
    [searchTerm, selectedSubject]
  );

  console.log('🚀 Virtualization Status:', { 
    shouldVirtualize, 
    noteCount: notes.length, 
    threshold: virtualizationThreshold,
    isInitialLoading,
    loading
  });

  return (
    <div className="space-y-6">
      {/* Error handling */}
      <NotesErrorHandler error={error} onRetry={refetch} />

      {/* Filters */}
      <NotesFiltersSection />

      {/* Main content with improved loading states */}
      <ProgressiveLoader 
        isLoading={isInitialLoading}
        isPartiallyLoaded={notes.length > 0}
        skeletonCount={6}
      >
        <div className="space-y-6">
          <NotesContentGrid
            notes={notes}
            shouldVirtualize={shouldVirtualize}
            viewMode={viewMode}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
            onCreateNote={onCreateNote}
            onImportNote={onImportNote}
          />
          
          {/* Load More Button - only show if we have notes */}
          {notes.length > 0 && (
            <NotesLoadMoreSection
              hasMore={hasMore}
              shouldVirtualize={shouldVirtualize}
              loading={loading}
              totalCount={totalCount}
              currentCount={notes.length}
              onLoadMore={loadMore}
            />
          )}
          
          {/* Notes Counter - only show if we have notes */}
          {notes.length > 0 && (
            <NotesCounter
              currentCount={notes.length}
              totalCount={totalCount}
              shouldVirtualize={shouldVirtualize}
            />
          )}
        </div>
      </ProgressiveLoader>
    </div>
  );
});

OptimizedNotesContent.displayName = 'OptimizedNotesContent';
