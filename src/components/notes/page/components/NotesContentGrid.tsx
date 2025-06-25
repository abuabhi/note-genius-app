
import React, { memo, useCallback } from 'react';
import { Note } from '@/types/note';
import { ViewMode } from '@/hooks/useViewPreferences';
import { VirtualizedNotesGrid } from '../../virtualization/VirtualizedNotesGrid';
import { OptimizedNotesGrid } from '../OptimizedNotesGrid';
import { toast } from 'sonner';

interface NotesContentGridProps {
  notes: Note[];
  shouldVirtualize: boolean;
  viewMode: ViewMode;
  onUpdateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export const NotesContentGrid = memo(({
  notes,
  shouldVirtualize,
  viewMode,
  onUpdateNote,
  onDeleteNote
}: NotesContentGridProps) => {
  
  const handlePin = useCallback(async (id: string, isPinned: boolean) => {
    try {
      await onUpdateNote(id, { pinned: !isPinned });
      toast.success(isPinned ? "Note unpinned" : "Note pinned");
    } catch (error) {
      console.error('Error pinning note:', error);
      toast.error('Failed to update note pin status');
    }
  }, [onUpdateNote]);

  const handleDelete = useCallback(async (id: string): Promise<void> => {
    try {
      await onDeleteNote(id);
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
      throw error;
    }
  }, [onDeleteNote]);

  const handleNoteClick = useCallback((note: Note) => {
    console.log('Note clicked:', note.id);
    // Navigation logic will be handled by the consuming component
  }, []);

  const handleShowDetails = useCallback((note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Show details for note:', note.id);
    // Details logic will be handled by the consuming component
  }, []);

  return (
    <div className="transition-all duration-300 ease-in-out">
      {shouldVirtualize ? (
        <VirtualizedNotesGrid
          notes={notes}
          onPin={handlePin}
          onDelete={handleDelete}
          onNoteClick={handleNoteClick}
          onShowDetails={handleShowDetails}
          viewMode={viewMode}
          height={600}
        />
      ) : (
        <OptimizedNotesGrid 
          notes={notes} 
          onPin={handlePin}
          onDelete={handleDelete}
          viewMode={viewMode}
        />
      )}
    </div>
  );
});

NotesContentGrid.displayName = 'NotesContentGrid';
