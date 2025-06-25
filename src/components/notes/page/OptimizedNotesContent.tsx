
import React, { useState, useCallback, useMemo } from 'react';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { ViewMode, useViewPreferences } from '@/hooks/useViewPreferences';
import { useVirtualizationMetrics } from '@/hooks/notes/useVirtualizationMetrics';

// Optimized selective hooks to minimize re-renders
import { 
  useNotesWithPagination, 
  useNotesFiltersOnly, 
  useNotesOperationsOnly 
} from '@/hooks/notes/useSelectiveNotesContext';

// New smaller components
import { NotesErrorHandler } from './components/NotesErrorHandler';
import { NotesFiltersSection } from './components/NotesFiltersSection';
import { NotesContentGrid } from './components/NotesContentGrid';
import { NotesLoadMoreSection } from './components/NotesLoadMoreSection';
import { NotesCounter } from './components/NotesCounter';

export const OptimizedNotesContent = React.memo(() => {
  // Use selective hooks instead of the monolithic context
  const {
    notes,
    totalCount,
    loading,
    hasMore,
    loadMore
  } = useNotesWithPagination();

  const {
    searchTerm,
    selectedSubject
  } = useNotesFiltersOnly();

  const {
    updateNote,
    deleteNote
  } = useNotesOperationsOnly();

  // SINGLE SOURCE OF TRUTH for view mode - only defined here
  const { viewMode, setViewMode } = useViewPreferences('notes');

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

  // Memoized callbacks to prevent unnecessary re-renders
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, [setViewMode]);

  // Memoized computed values
  const isFiltered = useMemo(() => 
    !!(searchTerm || selectedSubject !== 'all'), 
    [searchTerm, selectedSubject]
  );

  console.log('🎯 OptimizedNotesContent - MASTER viewMode:', viewMode);
  console.log('🚀 Virtualization Status:', { 
    shouldVirtualize, 
    noteCount: notes.length, 
    threshold: virtualizationThreshold 
  });

  return (
    <div className="space-y-8">
      {/* Error handling */}
      <NotesErrorHandler />

      {/* Enhanced Filters - removed virtualization toggle */}
      <NotesFiltersSection
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        useVirtualization={true} // Always enabled, no user control needed
        shouldVirtualize={shouldVirtualize}
        noteCount={notes.length}
        threshold={virtualizationThreshold}
        renderTime={metrics.renderTime}
        onVirtualizationToggle={() => {}} // No-op since toggle is removed
      />

      {/* Main content with improved loading states */}
      <ProgressiveLoader 
        isLoading={loading && notes.length === 0}
        isPartiallyLoaded={notes.length > 0}
        skeletonCount={6}
      >
        {notes.length === 0 && !loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5">
            <EmptyNotesState
              onCreateNote={() => {}}
              isFiltered={isFiltered}
            />
          </div>
        ) : (
          <div className="space-y-8">
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
