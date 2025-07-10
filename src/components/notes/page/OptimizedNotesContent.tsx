
import React, { useState, useCallback, useMemo } from 'react';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { useVirtualizationMetrics } from '@/hooks/notes/useVirtualizationMetrics';
import { Note } from '@/types/note';

// Use the server-side notes hook for optimized filtering
import { useServerSideNotes } from '@/hooks/useServerSideFilter';

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

export const OptimizedNotesContent = ({ viewMode, onCreateNote, onImportNote }: OptimizedNotesContentProps) => {
  // Use the server-side notes hook for optimized filtering
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
  } = useServerSideNotes();

  console.log('🚀 [OPTIMIZED NOTES CONTENT] Component is rendering! Data:', {
    notesLength: notes.length,
    selectedSubject,
    totalCount,
    loading,
    isInitialLoading,
    notesSummary: notes.map(n => ({ title: n.title, subject: n.subject }))
  });

  console.log('🚀 [OPTIMIZED NOTES CONTENT] CRITICAL DEBUG - About to render NotesContentGrid with:', {
    notesLength: notes.length,
    notesData: notes,
    isPassingNotes: notes.length > 0,
    componentShouldRender: true
  });

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
};
