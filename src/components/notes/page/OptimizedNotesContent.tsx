
import React, { useState, useCallback, useMemo } from 'react';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { useVirtualizationMetrics } from '@/hooks/notes/useVirtualizationMetrics';

// Use the unified OptimizedNotesContext instead of selective hooks
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

// New smaller components
import { NotesErrorHandler } from './components/NotesErrorHandler';
import { NotesFiltersSection } from './components/NotesFiltersSection';
import { NotesContentGrid } from './components/NotesContentGrid';
import { NotesLoadMoreSection } from './components/NotesLoadMoreSection';
import { NotesCounter } from './components/NotesCounter';

interface OptimizedNotesContentProps {
  viewMode: 'grid' | 'list';
}

export const OptimizedNotesContent = React.memo(({ viewMode }: OptimizedNotesContentProps) => {
  // Use the unified OptimizedNotesContext for consistent state management
  const {
    notes,
    totalCount,
    loading,
    hasMore,
    loadMore,
    searchTerm,
    selectedSubject,
    updateNote,
    deleteNote
  } = useOptimizedNotes();

  // Add initial loading state to prevent race condition
  const [hasEverLoaded, setHasEverLoaded] = React.useState(false);
  
  // Track when data has first loaded to prevent empty state flash
  React.useEffect(() => {
    if (!loading && notes.length >= 0) {
      setHasEverLoaded(true);
    }
  }, [loading, notes.length]);

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

  // Determine if we should show initial loading (prevents empty state flash)
  const isInitialLoading = useMemo(() => 
    loading && !hasEverLoaded,
    [loading, hasEverLoaded]
  );

  console.log('🚀 Virtualization Status:', { 
    shouldVirtualize, 
    noteCount: notes.length, 
    threshold: virtualizationThreshold 
  });

  return (
    <div className="space-y-6">
      {/* Error handling */}
      <NotesErrorHandler />

      {/* Filters */}
      <NotesFiltersSection />

      {/* Main content with improved loading states */}
      <ProgressiveLoader 
        isLoading={isInitialLoading}
        isPartiallyLoaded={notes.length > 0}
        skeletonCount={6}
      >
        {notes.length === 0 && !isInitialLoading && hasEverLoaded ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
            <EmptyNotesState
              onCreateNote={() => {}}
              isFiltered={isFiltered}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <NotesContentGrid
              notes={notes}
              shouldVirtualize={shouldVirtualize}
              viewMode={viewMode}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
            />
            
            {/* Load More Button */}
            <NotesLoadMoreSection
              hasMore={hasMore}
              shouldVirtualize={shouldVirtualize}
              loading={loading}
              totalCount={totalCount}
              currentCount={notes.length}
              onLoadMore={loadMore}
            />
            
            {/* Notes Counter */}
            <NotesCounter
              currentCount={notes.length}
              totalCount={totalCount}
              shouldVirtualize={shouldVirtualize}
            />
          </div>
        )}
      </ProgressiveLoader>
    </div>
  );
});

OptimizedNotesContent.displayName = 'OptimizedNotesContent';
