
import { memo } from 'react';
import { Note } from '@/types/note';
import { ViewMode } from '@/hooks/useViewPreferences';
import { EnhancedNoteCard } from '../page/EnhancedNoteCard';
import { CompactNoteCard } from '../card/CompactNoteCard';

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

  // Calculate which notes to render in this row
  const startIndex = index * itemsPerRow;
  const endIndex = Math.min(startIndex + itemsPerRow, notes.length);
  const rowNotes = notes.slice(startIndex, endIndex);

  // Don't render empty rows
  if (rowNotes.length === 0) {
    return <div style={style} />;
  }

  const renderNoteCard = (note: Note) => {
    if (viewMode === 'list') {
      return (
        <CompactNoteCard
          key={note.id}
          note={note}
          onNoteClick={onNoteClick}
          onShowDetails={onShowDetails}
          onPin={onPin}
          onDelete={onDelete}
          confirmDelete={null}
        />
      );
    }

    return (
      <EnhancedNoteCard
        key={note.id}
        note={note}
        onNoteClick={onNoteClick}
        onShowDetails={onShowDetails}
        onPin={onPin}
        onDelete={onDelete}
        confirmDelete={null}
      />
    );
  };

  return (
    <div style={style} className="px-2">
      {viewMode === 'list' ? (
        // List mode: single column
        <div className="space-y-3">
          {rowNotes.map(renderNoteCard)}
        </div>
      ) : (
        // Grid mode: multiple columns
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rowNotes.map(renderNoteCard)}
        </div>
      )}
    </div>
  );
});

VirtualizedNoteItem.displayName = 'VirtualizedNoteItem';

export default VirtualizedNoteItem;
