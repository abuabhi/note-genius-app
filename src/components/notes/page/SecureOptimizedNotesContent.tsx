
import React, { Suspense } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { OptimizedNotesGrid } from './components/OptimizedNotesGrid';
import { NotesHeader } from './NotesHeader';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyNotesState } from '../EmptyNotesState';
import { Note } from '@/types/note';

const NotesGridWrapper = React.memo(() => {
  const { 
    notes, 
    totalCount,
    loading, 
    error, 
    updateNote, 
    deleteNote,
    hasActiveFilters,
    searchTerm,
    selectedSubject
  } = useOptimizedNotes();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (notes.length === 0 && !hasActiveFilters) {
    return <EmptyNotesState />;
  }

  const hasFilters = hasActiveFilters || !!searchTerm || selectedSubject !== 'all';

  return (
    <OptimizedNotesGrid
      notes={notes}
      viewMode="grid"
      onUpdateNote={updateNote}
      onDeleteNote={deleteNote}
      totalCount={totalCount}
      hasFilters={hasFilters}
    />
  );
});

NotesGridWrapper.displayName = 'NotesGridWrapper';

export const SecureOptimizedNotesContent = () => {
  const { userProfile } = useRequireAuth();
  const { addNote } = useOptimizedNotes();

  const handleSaveNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      return await addNote(noteData);
    } catch (error) {
      console.error('Error saving note:', error);
      return null;
    }
  };

  const handleScanNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    return handleSaveNote({ ...noteData, sourceType: 'scan' });
  };

  const handleImportNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    return handleSaveNote({ ...noteData, sourceType: 'import' });
  };

  return (
    <div className="space-y-6">
      <NotesHeader
        onSaveNote={handleSaveNote}
        onScanNote={handleScanNote}
        onImportNote={handleImportNote}
      />
      
      <Suspense fallback={<LoadingState />}>
        <NotesGridWrapper />
      </Suspense>
    </div>
  );
};
