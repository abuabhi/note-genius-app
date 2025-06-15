
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
import { useViewPreferences } from '@/hooks/useViewPreferences';

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

  const { viewMode, setViewMode } = useViewPreferences('notes');

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
    return <ErrorState message={error.message || 'Failed to load notes'} />;
  }

  const showPerformanceIndicator = notes.length > 100;

  const handleCreateNote = async () => {
    await addNote({
      title: 'New Note',
      description: 'Enter your note description here...',
      content: '',
      date: new Date().toISOString().split('T')[0],
      subject: 'General',
      sourceType: 'manual'
    });
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    await updateNote(id, { pinned: !isPinned });
  };

  const handleDelete = async (id: string): Promise<void> => {
    await deleteNote(id);
  };

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
        totalCount={totalCount}
        onCreateNote={handleCreateNote}
        onOpenImportDialog={() => {}}
        isCreating={false}
      />

      {/* Filters and Search */}
      <OptimizedNotesFilters
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Notes Grid with Virtual Scrolling */}
      {notes.length === 0 ? (
        <EmptySubjectState
          subjectName={selectedSubject === 'all' ? 'All Subjects' : selectedSubject}
          onCreateNote={handleCreateNote}
        />
      ) : (
        <>
          <OptimizedNotesGrid
            notes={notes}
            onPin={handlePin}
            onDelete={handleDelete}
            viewMode={viewMode}
          />
          
          {/* Pagination with Performance Metrics */}
          <OptimizedNotesPagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            hasMore={hasMore}
            totalCount={totalCount}
            pageSize={20}
          />
        </>
      )}
    </div>
  );
};
