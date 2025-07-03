import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Note } from '@/types/note';
import { NoteCard } from '@/components/notes/card/NoteCard';

interface VirtualizedNotesGridProps {
  notes: Note[];
  loading?: boolean;
  height?: number;
  itemHeight?: number;
  onNoteUpdate?: (id: string, updates: Partial<Note>) => Promise<void>;
  onNoteDelete?: (id: string) => Promise<void>;
}

interface ItemData {
  notes: Note[];
  onNoteUpdate?: (id: string, updates: Partial<Note>) => Promise<void>;
  onNoteDelete?: (id: string) => Promise<void>;
}

const NoteItem = memo(({ index, style, data }: {
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}) => {
  const note = data.notes[index];
  
  if (!note) {
    return (
      <div style={style} className="p-2">
        <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
      </div>
    );
  }

  return (
    <div style={style} className="p-2">
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{note.content?.substring(0, 100)}...</p>
        <div className="text-xs text-gray-400 mt-2">
          {note.subject || 'General'}
        </div>
      </div>
    </div>
  );
});

NoteItem.displayName = 'VirtualizedNoteItem';

export const VirtualizedNotesGrid = memo(({
  notes,
  loading = false,
  height = 600,
  itemHeight = 200,
  onNoteUpdate,
  onNoteDelete
}: VirtualizedNotesGridProps) => {
  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo((): ItemData => ({
    notes,
    onNoteUpdate,
    onNoteDelete
  }), [notes, onNoteUpdate, onNoteDelete]);

  // Memoize item count
  const itemCount = useMemo(() => notes.length, [notes.length]);

  if (loading && itemCount === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No notes found</p>
      </div>
    );
  }

  // For small lists, render normally to avoid virtualization overhead
  if (itemCount < 20) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{note.content?.substring(0, 100)}...</p>
            <div className="text-xs text-gray-400 mt-2">
              {note.subject || 'General'}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <List
        height={height}
        width="100%"
        itemCount={itemCount}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5} // Render 5 extra items for smoother scrolling
      >
        {NoteItem}
      </List>
    </div>
  );
});

VirtualizedNotesGrid.displayName = 'VirtualizedNotesGrid';