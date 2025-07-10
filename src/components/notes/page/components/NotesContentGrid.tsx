
import React from 'react';
import { Note } from '@/types/note';
import { ViewMode } from '@/hooks/useViewPreferences';
import { OptimizedNotesGrid } from './OptimizedNotesGrid';
import { NotesEmptyStateRenderer } from '@/components/notes/empty-state/NotesEmptyStateRenderer';

interface NotesContentGridProps {
  notes: Note[];
  shouldVirtualize: boolean;
  viewMode: ViewMode;
  onUpdateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onCreateNote?: () => void;
  onImportNote?: () => void;
  hasActiveFilters?: boolean;
  selectedSubject?: string;
}

export const NotesContentGrid = ({
  notes,
  shouldVirtualize,
  viewMode,
  onUpdateNote,
  onDeleteNote,
  onCreateNote,
  onImportNote,
  hasActiveFilters = false,
  selectedSubject
}: NotesContentGridProps) => {

  // Always render the container to prevent flash screens during optimistic updates
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
      {notes.length === 0 ? (
        <NotesEmptyStateRenderer
          notes={notes}
          loading={false}
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
          shouldVirtualize={shouldVirtualize}
        />
      )}
    </div>
  );
};
