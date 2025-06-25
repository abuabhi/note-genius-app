
import { memo, useMemo } from 'react';
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

// Memoized note card renderer
const MemoizedNoteCard = memo(({ 
  note, 
  viewMode, 
  onNoteClick, 
  onShowDetails, 
  onPin, 
  onDelete 
}: {
  note: Note;
  viewMode: ViewMode;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
}) => {
  if (viewMode === 'list') {
    return (
      <CompactNoteCard
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
      note={note}
      onNoteClick={onNoteClick}
      onShowDetails={onShowDetails}
      onPin={onPin}
      onDelete={onDelete}
      confirmDelete={null}
    />
  );
});

MemoizedNoteCard.displayName = 'MemoizedNoteCard';

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

  return (
    <div style={style} className="px-2">
      {viewMode === 'list' ? (
        // List mode: single column
        <div className="space-y-3">
          {rowNotes.map(note => (
            <MemoizedNoteCard
              key={note.id}
              note={note}
              viewMode={viewMode}
              onNoteClick={onNoteClick}
              onShowDetails={onShowDetails}
              onPin={onPin}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        // Grid mode: multiple columns
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rowNotes.map(note => (
            <MemoizedNoteCard
              key={note.id}
              note={note}
              viewMode={viewMode}
              onNoteClick={onNoteClick}
              onShowDetails={onShowDetails}
              onPin={onPin}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
});

VirtualizedNoteItem.displayName = 'VirtualizedNoteItem';

export default VirtualizedNoteItem;
