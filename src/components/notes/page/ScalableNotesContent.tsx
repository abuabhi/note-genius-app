
import React from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { NotesHeader } from './NotesHeader';
import { NotesDisplay } from './NotesDisplay';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { Note } from '@/types/note';

interface ScalableNotesContentProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onScanNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  onImportNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
}

export const ScalableNotesContent: React.FC<ScalableNotesContentProps> = ({
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

  console.log('📝 [SCALABLE NOTES CONTENT] Using optimized context:', {
    notesCount: notes.length,
    totalCount,
    loading
  });

  if (loading && notes.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={typeof error === 'string' ? error : 'Failed to load notes'} />;
  }

  // Map the optimized context to the legacy interface
  const legacyContextValue = {
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
    totalPages: Math.ceil(totalCount / 20),
    loading,
    availableSubjects: [],
    // Map functions with compatibility wrapper
    addNote: async (noteData: Omit<Note, 'id'>) => {
      const result = await addNote(noteData);
      if (result) {
        return result;
      }
      throw new Error('Failed to add note');
    },
    updateNote,
    deleteNote,
    pinNote: async (id: string, pinned: boolean) => {
      await updateNote(id, { pinned });
    },
    archiveNote: async (id: string) => {
      await updateNote(id, { archived: true });
    }
  };

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
        isFiltered={!!(searchTerm || selectedSubject !== 'all')}
        activeSubject={selectedSubject}
      />
    </div>
  );
};
