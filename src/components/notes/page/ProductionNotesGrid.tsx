import React, { useMemo } from 'react';
import { Note } from '@/types/note';
import { NoteCard } from '@/components/notes/card/NoteCard';
import { LoadingState } from '@/components/notes/page/LoadingState';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { ProductionNotesListView } from './ProductionNotesListView';
import { useProductionNotes } from '@/contexts/ProductionNotesContext';

interface ProductionNotesGridProps {
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const ProductionNotesGrid = React.memo(({ className = '', viewMode = 'grid' }: ProductionNotesGridProps) => {
  const { 
    notes, 
    loading, 
    error, 
    deleteNote, 
    updateNote,
    isDeleting 
  } = useProductionNotes();

  console.log('🎯 ProductionNotesGrid render:', {
    notesCount: notes.length,
    loading,
    error,
    isDeleting
  });

  // Memoize note operations to prevent unnecessary re-renders
  const noteOperations = useMemo(() => ({
    onNoteClick: (note: Note) => {
      // Navigate to note study page
      window.location.href = `/notes/study/${note.id}`;
    },
    onShowDetails: (note: Note, e: React.MouseEvent) => {
      e.stopPropagation();
      // Could open details modal in future
      console.log('Show details for note:', note.id);
    },
    onDelete: async (id: string) => {
      console.log('🗑️ ProductionNotesGrid - Deleting note:', id);
      await deleteNote(id);
    },
    onPin: async (id: string, pinned: boolean) => {
      console.log('📌 ProductionNotesGrid - Pinning note:', id, pinned);
      await updateNote(id, { pinned });
    },
  }), [deleteNote, updateNote]);

  // Loading state with skeleton
  if (loading && notes.length === 0) {
    return (
      <div className={`production-notes-grid ${className}`}>
        <LoadingState />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`production-notes-grid ${className}`}>
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">Error loading notes: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (notes.length === 0) {
    return (
      <div className={`production-notes-grid ${className}`}>
        <EmptyNotesState />
      </div>
    );
  }

  // Notes display - list or grid
  return (
    <div className={`production-notes-display ${className}`}>
      {viewMode === 'list' ? (
        <ProductionNotesListView
          notes={notes}
          onNoteClick={noteOperations.onNoteClick}
          onPin={noteOperations.onPin}
          onDelete={noteOperations.onDelete}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onNoteClick={noteOperations.onNoteClick}
              onShowDetails={noteOperations.onShowDetails}
              onDelete={noteOperations.onDelete}
              onPin={noteOperations.onPin}
              confirmDelete={null}
              viewMode="grid"
            />
          ))}
        </div>
      )}
      
      {/* Loading indicator for background operations */}
      {loading && notes.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
});

ProductionNotesGrid.displayName = 'ProductionNotesGrid';