
import React, { memo } from 'react';
import { Note } from '@/types/note';
import { ViewMode } from '@/hooks/useViewPreferences';
import { OptimizedNotesGrid } from './OptimizedNotesGrid';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';

interface NotesContentGridProps {
  notes: Note[];
  shouldVirtualize: boolean;
  viewMode: ViewMode;
  onUpdateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onCreateNote?: () => void;
  onImportNote?: () => void;
}

export const NotesContentGrid = memo(({
  notes,
  shouldVirtualize,
  viewMode,
  onUpdateNote,
  onDeleteNote,
  onCreateNote,
  onImportNote
}: NotesContentGridProps) => {
  console.log('🎯 NotesContentGrid - Rendering with:', { 
    noteCount: notes.length, 
    viewMode, 
    shouldVirtualize 
  });

  // Always render the container to prevent flash screens during optimistic updates
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
      {notes.length === 0 ? (
        <EmptyNotesState 
          onCreateNote={onCreateNote} 
          onImportNote={onImportNote}
          isFiltered={false} 
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
});

NotesContentGrid.displayName = 'NotesContentGrid';
