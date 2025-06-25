
import { memo, useMemo } from 'react';
import { Note } from '@/types/note';
import { ViewMode } from '@/hooks/useViewPreferences';
import { NoteCard } from '@/components/notes/card/NoteCard';

interface VirtualizedNoteItemData {
  notes: Note[];
  itemsPerRow: number;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  viewMode: ViewMode;
}

interface VirtualizedNoteItemProps {
  index: number;
  style: React.CSSProperties;
  data: VirtualizedNoteItemData;
}

export const VirtualizedNoteItem = memo(({ index, style, data }: VirtualizedNoteItemProps) => {
  const { notes, itemsPerRow, onPin, onDelete, onNoteClick, onShowDetails, viewMode } = data;

  // Memoize row notes calculation
  const rowNotes = useMemo(() => {
    const startIndex = index * itemsPerRow;
    const endIndex = Math.min(startIndex + itemsPerRow, notes.length);
    return notes.slice(startIndex, endIndex);
  }, [notes, index, itemsPerRow]);

  // Don't render empty rows
  if (rowNotes.length === 0) {
    return <div style={style} />;
  }

  const gridClasses = useMemo(() => {
    switch (viewMode) {
      case 'list':
        return 'flex flex-col space-y-4';
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
      case 'grid':
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  }, [viewMode]);

  return (
    <div style={style} className="px-2">
      <div className={gridClasses}>
        {rowNotes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onNoteClick={onNoteClick}
            onShowDetails={onShowDetails}
            onPin={onPin}
            onDelete={onDelete}
            confirmDelete={null}
          />
        ))}
      </div>
    </div>
  );
});

VirtualizedNoteItem.displayName = 'VirtualizedNoteItem';

export default VirtualizedNoteItem;
