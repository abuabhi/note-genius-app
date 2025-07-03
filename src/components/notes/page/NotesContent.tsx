
import React, { memo, useMemo, useCallback } from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { NotesHeader } from './NotesHeader';
import { NotesDisplay } from './NotesDisplay';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { Note } from '@/types/note';

interface NotesContentProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
}

export const NotesContent: React.FC<NotesContentProps> = memo(({
  onSaveNote,
  onScanNote,
  onImportNote
}) => {
  const {
    notes,
    totalCount,
    loading,
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

  console.log('📝 [NOTES CONTENT] Using optimized context:', {
    notesCount: notes.length,
    totalCount,
    loading
  });

  if (loading && notes.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error || 'Failed to load notes'} />;
  }

  // Memoize expensive calculations
  const totalPages = useMemo(() => Math.ceil(totalCount / 20), [totalCount]);
  
  const isFiltered = useMemo(() => 
    !!(searchTerm || selectedSubject !== 'all'), 
    [searchTerm, selectedSubject]
  );

  // Memoize callback functions to prevent unnecessary re-renders
  const handleAddNote = useCallback(async (noteData: Omit<Note, 'id'>) => {
    const result = await addNote(noteData);
    if (result) {
      return result;
    }
    throw new Error('Failed to add note');
  }, [addNote]);

  const handlePinNote = useCallback(async (id: string, pinned: boolean) => {
    await updateNote(id, { pinned });
  }, [updateNote]);

  const handleArchiveNote = useCallback(async (id: string) => {
    await updateNote(id, { archived: true });
  }, [updateNote]);

  // Map the optimized context to the legacy interface
  const legacyContextValue = useMemo(() => ({
    notes,
    filteredNotes: notes,
    paginatedNotes: notes,
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
    totalPages,
    loading,
    availableSubjects: [],
    // Map functions with compatibility wrapper
    addNote: handleAddNote,
    updateNote,
    deleteNote,
    pinNote: handlePinNote,
    archiveNote: handleArchiveNote
  }), [
    notes,
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
    totalPages,
    loading,
    handleAddNote,
    updateNote,
    deleteNote,
    handlePinNote,
    handleArchiveNote
  ]);

  return (
    <div className="space-y-6">
      <NotesHeader 
        onSaveNote={onSaveNote}
        onScanNote={onScanNote}
        onImportNote={onImportNote}
      />
      
      <NotesDisplay 
        notes={legacyContextValue.notes}
        paginatedNotes={legacyContextValue.paginatedNotes}
        loading={legacyContextValue.loading}
        isFiltered={isFiltered}
        activeSubject={selectedSubject}
      />
    </div>
  );
});

NotesContent.displayName = 'NotesContent';
