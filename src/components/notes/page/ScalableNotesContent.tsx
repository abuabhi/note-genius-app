
import React from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { OptimizedNotesHeader } from './OptimizedNotesHeader';
import { OptimizedNotesFilters } from './OptimizedNotesFilters';
import { OptimizedNotesGrid } from './OptimizedNotesGrid';
import { OptimizedNotesPagination } from './OptimizedNotesPagination';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptySubjectState } from './EmptySubjectState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp } from 'lucide-react';

export const ScalableNotesContent = () => {
  const {
    notes,
    totalCount,
    hasMore,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    sortType,
    setSortType,
    showArchived,
    setShowArchived,
    selectedSubject,
    setSelectedSubject,
    currentPage,
    setCurrentPage,
    addNote,
    updateNote,
    deleteNote
  } = useOptimizedNotes();

  console.log('🚀 [SCALABLE NOTES] Rendering with performance optimizations:', {
    notesCount: notes.length,
    totalCount,
    hasMore,
    currentPage,
    isLoading
  });

  if (isLoading && notes.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const showPerformanceIndicator = notes.length > 100;

  return (
    <div className="space-y-6">
      {/* Performance Indicator */}
      {showPerformanceIndicator && (
        <Alert className="border-mint-200 bg-mint-50">
          <TrendingUp className="h-4 w-4 text-mint-600" />
          <AlertDescription className="text-mint-700">
            <strong>Performance Mode Active:</strong> Showing {notes.length} of {totalCount} notes with optimized loading
          </AlertDescription>
        </Alert>
      )}

      {/* Header with Create Actions */}
      <OptimizedNotesHeader 
        onAddNote={addNote}
        totalCount={totalCount}
        showArchived={showArchived}
      />

      {/* Filters and Search */}
      <OptimizedNotesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortType={sortType}
        onSortChange={setSortType}
        showArchived={showArchived}
        onShowArchivedChange={setShowArchived}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
      />

      {/* Notes Grid with Virtual Scrolling */}
      {notes.length === 0 ? (
        <EmptySubjectState
          selectedSubject={selectedSubject}
          searchTerm={searchTerm}
          showArchived={showArchived}
        />
      ) : (
        <>
          <OptimizedNotesGrid
            notes={notes}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
            isLoading={isLoading}
          />
          
          {/* Pagination with Performance Metrics */}
          <OptimizedNotesPagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            hasMore={hasMore}
            totalCount={totalCount}
            itemsPerPage={20}
            showPerformanceMetrics={showPerformanceIndicator}
          />
        </>
      )}
    </div>
  );
};
