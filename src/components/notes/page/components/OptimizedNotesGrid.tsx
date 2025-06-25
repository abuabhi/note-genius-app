
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
  totalCount?: number;
  hasFilters?: boolean;
}

export const OptimizedNotesGrid = memo(({
  notes,
  viewMode,
  onUpdateNote,
  onDeleteNote,
  shouldVirtualize = false,
  totalCount,
  hasFilters = false
}: OptimizedNotesGridProps) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handlePin = useMemo(() => async (id: string, isPinned: boolean) => {
    try {
      await onUpdateNote(id, { pinned: !isPinned });
    } catch (error) {
      console.error('Error pinning note:', error);
    }
  }, [onUpdateNote]);

  const handleNoteClick = useMemo(() => (note: Note) => {
    navigate(`/notes/study/${note.id}`);
  }, [navigate]);

  const handleShowDetails = useMemo(() => (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    // Note details functionality can be added here if needed
  }, []);

  const pinnedNotes = useMemo(() => notes.filter(note => note.pinned), [notes]);
  const unpinnedNotes = useMemo(() => notes.filter(note => !note.pinned), [notes]);

  const gridClasses = useMemo(() => {
    switch (viewMode) {
      case 'list':
        return 'flex flex-col space-y-3';
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
      case 'grid':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  }, [viewMode]);

  return (
    <div className="space-y-8">
      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">Pinned Notes</h3>
            <div className="h-px bg-gradient-to-r from-yellow-200 to-transparent flex-1 ml-4"></div>
          </div>
          <div className={gridClasses}>
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onNoteClick={handleNoteClick}
                onShowDetails={handleShowDetails}
                onPin={handlePin}
                onDelete={onDeleteNote}
                confirmDelete={confirmDelete}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Notes Section */}
      {unpinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mint-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">
              {pinnedNotes.length > 0 ? 'All Notes' : 'My Notes'}
            </h3>
            <div className="h-px bg-gradient-to-r from-mint-200 to-transparent flex-1 ml-4"></div>
          </div>
          <div className={gridClasses}>
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onNoteClick={handleNoteClick}
                onShowDetails={handleShowDetails}
                onPin={handlePin}
                onDelete={onDeleteNote}
                confirmDelete={confirmDelete}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Notes Counter */}
      {totalCount && totalCount > 0 && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-gray-600">
            {hasFilters || notes.length !== totalCount 
              ? `${notes.length} of ${totalCount} ${totalCount === 1 ? 'note' : 'notes'}`
              : `${totalCount} ${totalCount === 1 ? 'note' : 'notes'}`
            }
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedNotesGrid.displayName = 'OptimizedNotesGrid';
