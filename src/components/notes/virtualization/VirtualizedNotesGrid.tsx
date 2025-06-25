
import { memo, forwardRef, useRef, useEffect, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Note } from '@/types/note';
import { ViewMode } from '@/hooks/useViewPreferences';
import { VirtualizedNoteItem } from './VirtualizedNoteItem';
import { useVirtualizedNotes } from '@/hooks/notes/useVirtualizedNotes';

interface VirtualizedNotesGridProps {
  notes: Note[];
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  viewMode: ViewMode;
  height?: number;
}

// Memoized pinned notes section
const PinnedNotesSection = memo(({ 
  pinnedNotes, 
  viewMode, 
  onPin, 
  onDelete, 
  onNoteClick, 
  onShowDetails 
}: {
  pinnedNotes: Note[];
  viewMode: ViewMode;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
}) => {
  const gridClasses = viewMode === 'list' 
    ? "space-y-3" 
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-800">Pinned Notes</h3>
        <div className="h-px bg-gradient-to-r from-yellow-200 to-transparent flex-1 ml-4"></div>
      </div>
      <div className={gridClasses}>
        {pinnedNotes.map(note => (
          <VirtualizedNoteItem
            key={note.id}
            index={0}
            style={{}}
            data={{
              notes: [note],
              itemsPerRow: 1,
              onPin,
              onDelete,
              onNoteClick,
              onShowDetails,
              viewMode,
            }}
          />
        ))}
      </div>
    </div>
  );
});

PinnedNotesSection.displayName = 'PinnedNotesSection';

export const VirtualizedNotesGrid = memo(({
  notes,
  onPin,
  onDelete,  
  onNoteClick,
  onShowDetails,
  viewMode,
  height = 600,
}: VirtualizedNotesGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<any>(null);

  const {
    virtualizedConfig,
    shouldVirtualize,
    getItemSize,
    getItemData,
    resetScrollPosition,
  } = useVirtualizedNotes({
    notes,
    viewMode,
    onPin,
    onDelete,
    onNoteClick,
    onShowDetails,
    containerRef,
  });

  // Reset scroll when filters change
  useEffect(() => {
    resetScrollPosition();
  }, [resetScrollPosition]);

  // Memoize note separation
  const { pinnedNotes, unpinnedNotes } = useMemo(() => {
    const pinned = notes.filter(note => note.pinned);
    const unpinned = notes.filter(note => !note.pinned);
    return { pinnedNotes: pinned, unpinnedNotes: unpinned };
  }, [notes]);

  // Memoize grid classes
  const gridClasses = useMemo(() => 
    viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
    [viewMode]
  );

  // Memoize total rows calculation
  const totalRows = useMemo(() => 
    Math.ceil(unpinnedNotes.length / virtualizedConfig.itemsPerRow),
    [unpinnedNotes.length, virtualizedConfig.itemsPerRow]
  );

  // Memoize item data
  const itemData = useMemo(() => ({
    ...getItemData(),
    notes: unpinnedNotes,
  }), [getItemData, unpinnedNotes]);

  // If we don't need virtualization, fall back to regular rendering
  if (!shouldVirtualize) {
    return (
      <div ref={containerRef} className="space-y-8">
        {/* Render normally without virtualization */}
        {pinnedNotes.length > 0 && (
          <PinnedNotesSection
            pinnedNotes={pinnedNotes}
            viewMode={viewMode}
            onPin={onPin}
            onDelete={onDelete}
            onNoteClick={onNoteClick}
            onShowDetails={onShowDetails}
          />
        )}

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
              {unpinnedNotes.map(note => (
                <VirtualizedNoteItem
                  key={note.id}
                  index={0}
                  style={{}}
                  data={{
                    notes: [note],
                    itemsPerRow: 1,
                    onPin,
                    onDelete,
                    onNoteClick,
                    onShowDetails,
                    viewMode,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Always render pinned notes normally (usually small number) */}
      {pinnedNotes.length > 0 && (
        <PinnedNotesSection
          pinnedNotes={pinnedNotes}
          viewMode={viewMode}
          onPin={onPin}
          onDelete={onDelete}
          onNoteClick={onNoteClick}
          onShowDetails={onShowDetails}
        />
      )}

      {/* Virtualized unpinned notes */}
      {unpinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mint-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">
              {pinnedNotes.length > 0 ? 'All Notes' : 'My Notes'}
            </h3>
            <div className="h-px bg-gradient-to-r from-mint-200 to-transparent flex-1 ml-4"></div>
          </div>
          
          <div className="relative">
            <List
              ref={listRef}
              height={height}
              width="100%"
              itemCount={totalRows}
              itemSize={virtualizedConfig.itemHeight}
              itemData={itemData}
              overscanCount={virtualizedConfig.overscan}
              className="virtualized-notes-list"
            >
              {VirtualizedNoteItem}
            </List>
          </div>
        </div>
      )}
    </div>
  );
});

VirtualizedNotesGrid.displayName = 'VirtualizedNotesGrid';

export default VirtualizedNotesGrid;
