
import { useState } from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { Note } from '@/types/note';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { OptimizedNotesHeader } from './OptimizedNotesHeader';
import { OptimizedNotesFilters } from './OptimizedNotesFilters';
import { OptimizedNotesGrid } from './OptimizedNotesGrid';
import { OptimizedNotesPagination } from './OptimizedNotesPagination';
import { ErrorState } from './ErrorState';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';

export const OptimizedNotesContent = () => {
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
    refetch,
    addNote
  } = useOptimizedNotes();

  const [creatingNote, setCreatingNote] = useState(false);

  const handleCreateNote = async () => {
    setCreatingNote(true);
    try {
      await addNote({
        title: 'New Note',
        description: 'Enter your note description here...',
        content: '',
        date: new Date().toISOString().split('T')[0],
        category: 'General',
        sourceType: 'manual',
        subject: 'General'
      });
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setCreatingNote(false);
    }
  };

  if (error) {
    return (
      <ErrorState 
        message={`Failed to load notes: ${error.message || 'Unknown error'}`}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <OptimizedNotesHeader 
        totalCount={totalCount}
        onCreateNote={handleCreateNote}
        isCreating={creatingNote}
      />

      {/* Filters and search */}
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

      {/* Main content */}
      <ProgressiveLoader 
        isLoading={isLoading}
        isPartiallyLoaded={notes.length > 0}
        skeletonCount={6}
      >
        {notes.length === 0 ? (
          <EmptyNotesState
            onCreateNote={handleCreateNote}
            isFiltered={!!(searchTerm || selectedSubject !== 'all' || showArchived)}
          />
        ) : (
          <>
            <OptimizedNotesGrid notes={notes} />
            
            {totalCount > 20 && (
              <OptimizedNotesPagination
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={20}
                onPageChange={setCurrentPage}
                hasMore={hasMore}
              />
            )}
          </>
        )}
      </ProgressiveLoader>
    </div>
  );
};
