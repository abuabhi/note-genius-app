
import React, { memo, useMemo } from 'react';
import { Note } from '@/types/note';
import { ViewMode } from '@/hooks/useViewPreferences';
import { NoteCard } from '@/components/notes/card/NoteCard';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface OptimizedNotesGridProps {
  notes: Note[];
  viewMode: ViewMode;
  onUpdateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  shouldVirtualize?: boolean;
}

// Memoized individual note component for optimal rendering
const MemoizedNoteCard = memo(({ 
  note, 
  onPin, 
  onDelete, 
  onNoteClick, 
  onShowDetails 
}: {
  note: Note;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
}) => (
  <NoteCard
    note={note}
    onNoteClick={onNoteClick}
    onShowDetails={onShowDetails}
    onPin={onPin}
    onDelete={onDelete}
    confirmDelete={null}
  />
));

MemoizedNoteCard.displayName = 'MemoizedNoteCard';

export const OptimizedNotesGrid = memo(({
  notes,
  viewMode,
  onUpdateNote,
  onDeleteNote,
  shouldVirtualize = false
}: OptimizedNotesGridProps) => {
  const navigate = useNavigate();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Memoized handlers to prevent unnecessary re-renders
  const handlePin = useMemo(() => async (id: string, isPinned: boolean) => {
    try {
      await onUpdateNote(id, { pinned: !isPinned });
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  }, [onUpdateNote]);

  const handleNoteClick = useMemo(() => (note: Note) => {
    navigate(`/notes/${note.id}`);
  }, [navigate]);

  const handleShowDetails = useMemo(() => (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNote(note);
  }, []);

  // Optimize grid layout based on view mode
  const gridClasses = useMemo(() => {
    switch (viewMode) {
      case 'list':
        return 'flex flex-col space-y-4';
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  }, [viewMode]);

  // Virtual scrolling for large lists (if enabled)
  const displayNotes = useMemo(() => {
    if (shouldVirtualize && notes.length > 50) {
      // Basic virtualization - show first 50 items initially
      return notes.slice(0, 50);
    }
    return notes;
  }, [notes, shouldVirtualize]);

  console.log(`🎯 OptimizedNotesGrid rendering ${displayNotes.length} notes in ${viewMode} mode`);

  return (
    <div className={gridClasses}>
      {displayNotes.map((note) => (
        <MemoizedNoteCard
          key={note.id}
          note={note}
          onPin={handlePin}
          onDelete={onDeleteNote}
          onNoteClick={handleNoteClick}
          onShowDetails={handleShowDetails}
        />
      ))}
    </div>
  );
});

OptimizedNotesGrid.displayName = 'OptimizedNotesGrid';
