import React, { Suspense } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useSimpleNotes } from '@/hooks/useSimpleNotes';
import { SimplifiedNotesHeader } from './components/SimplifiedNotesHeader';
import { OptimizedNotesGrid } from './components/OptimizedNotesGrid';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyNotesState } from '../EmptyNotesState';
import { Note } from '@/types/note';
import { useState } from 'react';
import { NoteCreationDialogs } from './NoteCreationDialogs';
import { NotesFiltersSection } from './components/NotesFiltersSection';

const SimplifiedNotesGridWrapper = React.memo(() => {
  console.log('🔄 [SIMPLIFIED GRID] Component rendering');
  
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
  } = useSimpleNotes();

  console.log('🔄 [SIMPLIFIED GRID] Current data:', {
    notesCount: notes.length,
    totalCount,
    loading,
    error,
    hasActiveFilters,
    searchTerm,
    selectedSubject
  });

  if (loading) {
    console.log('🔄 [SIMPLIFIED GRID] Showing loading state');
    return <LoadingState />;
  }

  if (error) {
    console.log('🔄 [SIMPLIFIED GRID] Showing error state:', error);
    return <ErrorState message={error} />;
  }

  if (notes.length === 0 && !hasActiveFilters) {
    console.log('🔄 [SIMPLIFIED GRID] Showing empty state');
    return <EmptyNotesState />;
  }

  const hasFilters = hasActiveFilters || !!searchTerm || selectedSubject !== 'all';

  console.log('🔄 [SIMPLIFIED GRID] Rendering grid with', notes.length, 'notes');

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

SimplifiedNotesGridWrapper.displayName = 'SimplifiedNotesGridWrapper';

export const SimplifiedNotesContent = () => {
  console.log('🔄 [SIMPLIFIED CONTENT] Component rendering');
  
  const { userProfile } = useRequireAuth();
  const { addNote } = useSimpleNotes();
  
  // Dialog states
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleSaveNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    console.log('💾 [SIMPLIFIED CONTENT] Saving note:', noteData);
    try {
      const result = await addNote(noteData);
      console.log('✅ [SIMPLIFIED CONTENT] Note saved successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [SIMPLIFIED CONTENT] Error saving note:', error);
      return null;
    }
  };

  const handleScanNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    console.log('📷 [SIMPLIFIED CONTENT] Scanning note:', noteData);
    return handleSaveNote({ ...noteData, sourceType: 'scan' });
  };

  const handleImportNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    console.log('📄 [SIMPLIFIED CONTENT] Importing note:', noteData);
    return handleSaveNote({ ...noteData, sourceType: 'import' });
  };

  return (
    <div className="space-y-6">
      <SimplifiedNotesHeader
        onOpenManualDialog={() => setIsManualDialogOpen(true)}
        onOpenImportDialog={() => setIsImportDialogOpen(true)}
      />
      
      {/* Add the filters section */}
      <NotesFiltersSection />
      
      <Suspense fallback={<LoadingState />}>
        <SimplifiedNotesGridWrapper />
      </Suspense>
      
      <NoteCreationDialogs
        isManualDialogOpen={isManualDialogOpen}
        setIsManualDialogOpen={setIsManualDialogOpen}
        isImportDialogOpen={isImportDialogOpen}
        setIsImportDialogOpen={setIsImportDialogOpen}
        onSaveNote={handleSaveNote}
        onScanNote={handleScanNote}
        onImportNote={handleImportNote}
      />
    </div>
  );
};