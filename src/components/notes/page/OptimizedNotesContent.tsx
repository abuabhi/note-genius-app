
import React, { useState, useCallback, useMemo } from 'react';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { useVirtualizationMetrics } from '@/hooks/notes/useVirtualizationMetrics';
import { Note } from '@/types/note';

// Use the unified OptimizedNotesContext instead of selective hooks
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

// Import NotesHeader for note creation
import { NotesHeader } from './NotesHeader';

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
    isInitialLoading,
    hasMore,
    loadMore,
    searchTerm,
    selectedSubject,
    updateNote,
    deleteNote,
    addNote
  } = useOptimizedNotes();

  // Note creation handlers using OptimizedNotesContext
  const handleSaveNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      console.log('📝 [OPTIMIZED NOTES CONTENT] Creating note via OptimizedNotesContext:', noteData.title);
      const result = await addNote(noteData);
      if (result) {
        console.log('✅ [OPTIMIZED NOTES CONTENT] Note created successfully - UI should update immediately:', result.id);
        return result;
      } else {
        console.error('❌ [OPTIMIZED NOTES CONTENT] Note creation failed - no result returned');
        return null;
      }
    } catch (error) {
      console.error('❌ [OPTIMIZED NOTES CONTENT] Error creating note:', error);
      return null;
    }
  }, [addNote]);

  const handleScanNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    console.log('📷 [OPTIMIZED NOTES CONTENT] Scanning note via OptimizedNotesContext');
    return handleSaveNote({ ...noteData, sourceType: 'scan' });
  }, [handleSaveNote]);

  const handleImportNote = useCallback(async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    console.log('📥 [OPTIMIZED NOTES CONTENT] Importing note via OptimizedNotesContext');
    return handleSaveNote({ ...noteData, sourceType: 'import' });
  }, [handleSaveNote]);

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
      {/* Note Creation Header */}
      <NotesHeader
        onSaveNote={handleSaveNote}
        onScanNote={handleScanNote}
        onImportNote={handleImportNote}
      />

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
        {notes.length === 0 && !isInitialLoading ? (
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
