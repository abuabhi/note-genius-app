
import React from 'react';
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

export const NotesContentGrid = ({
  notes,
  shouldVirtualize,
  viewMode,
  onUpdateNote,
  onDeleteNote,
  onCreateNote,
  onImportNote
}: NotesContentGridProps) => {
  console.log('🎯 [NOTES CONTENT GRID] COMPONENT IS RENDERING! Notes data:', { 
    noteCount: notes.length, 
    viewMode, 
    shouldVirtualize,
    notesTitles: notes.map(n => n.title),
    notesSubjects: notes.map(n => n.subject),
    notesDetails: notes.map(n => ({ id: n.id, title: n.title, subject: n.subject }))
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
};
