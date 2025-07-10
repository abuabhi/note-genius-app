import React from 'react';
import { Note } from '@/types/note';
import { NotesEmptyStateRenderer } from '@/components/notes/empty-state/NotesEmptyStateRenderer';
import { OptimizedNotesGrid } from './page/components/OptimizedNotesGrid';

interface NotesGridProps {
  notes: Note[];
  viewMode: 'grid' | 'list';
  onUpdateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onCreateNote?: () => void;
  onImportNote?: () => void;
  loading: boolean;
  hasActiveFilters?: boolean;
  selectedSubject?: string;
}

export const NotesGrid = ({
  notes,
  viewMode,
  onUpdateNote,
  onDeleteNote,
  onCreateNote,
  onImportNote,
  loading,
  hasActiveFilters = false,
  selectedSubject
}: NotesGridProps) => {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
      {notes.length === 0 ? (
        <NotesEmptyStateRenderer
          notes={notes}
          loading={loading}
          error={null}
          hasActiveFilters={hasActiveFilters}
          selectedSubject={selectedSubject || 'all'}
          onCreateNote={onCreateNote}
          onImportNote={onImportNote}
        />
      ) : (
        <OptimizedNotesGrid
          notes={notes}
          viewMode={viewMode}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
          shouldVirtualize={notes.length > 50}
        />
      )}
    </div>
  );
};