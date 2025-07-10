
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
  console.log('🎯 [NOTES CONTENT GRID] COMPONENT IS RENDERING! Notes data:', { 
    noteCount: notes.length, 
    viewMode, 
    shouldVirtualize,
    notesTitles: notes.map(n => n.title),
    notesSubjects: notes.map(n => n.subject),
    notesDetails: notes.map(n => ({ id: n.id, title: n.title, subject: n.subject }))
  });

  console.log('🎯 [NOTES CONTENT GRID] DETAILED DEBUG:', {
    notesLength: notes.length,
    notes: notes,
    willShowEmptyState: notes.length === 0,
    willShowOptimizedGrid: notes.length > 0
  });

  // Always render the container to prevent flash screens during optimistic updates
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-mint-500/5 p-6">
      {notes.length === 0 ? (
        <>
          {console.log('🚨 [NOTES CONTENT GRID] RENDERING EMPTY STATE - No notes found!')}
          <EmptyNotesState 
            onCreateNote={onCreateNote} 
            onImportNote={onImportNote}
            isFiltered={hasActiveFilters}
            selectedSubject={selectedSubject}
          />
        </>
      ) : (
        <>
          {console.log('🎯 [NOTES CONTENT GRID] RENDERING OPTIMIZED GRID with notes:', notes.map(n => ({ title: n.title, subject: n.subject })))}
          <OptimizedNotesGrid
            notes={notes}
            viewMode={viewMode}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
            shouldVirtualize={shouldVirtualize}
          />
        </>
      )}
    </div>
  );
};
