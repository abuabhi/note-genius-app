import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Note } from '@/types/note';
import { NoteCard } from '@/components/notes/card/NoteCard';
import { ViewMode } from '@/hooks/useViewPreferences';
import { useVirtualizationMetrics } from '@/hooks/notes/useVirtualizationMetrics';
import { useNotesCache } from '@/hooks/notes/useNotesCache';
import { useMemoryOptimization } from '@/hooks/notes/useMemoryOptimization';

interface VirtualizedNotesGridProps {
  notes: Note[];
  viewMode: ViewMode;
  loading?: boolean;
  height?: number;
  onNoteUpdate?: (id: string, updates: Partial<Note>) => Promise<void>;
  onNoteDelete?: (id: string) => Promise<void>;
  onNoteClick?: (note: Note) => void;
  onShowDetails?: (note: Note, e: React.MouseEvent) => void;
  itemsPerRow?: number;
  debugMode?: boolean;
}

interface ItemData {
  notes: Note[];
  viewMode: ViewMode;
  itemsPerRow: number;
  onNoteUpdate?: (id: string, updates: Partial<Note>) => Promise<void>;
  onNoteDelete?: (id: string) => Promise<void>;
  onNoteClick?: (note: Note) => void;
  onShowDetails?: (note: Note, e: React.MouseEvent) => void;
  onPin?: (id: string, isPinned: boolean) => void;
}

const VirtualizedRow = memo(({ index, style, data }: {
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}) => {
  const { notes, viewMode, itemsPerRow, onNoteClick, onShowDetails, onPin, onNoteUpdate, onNoteDelete } = data;
  const startIndex = index * itemsPerRow;
  const rowNotes = notes.slice(startIndex, startIndex + itemsPerRow);

  const handlePin = useCallback(async (id: string, isPinned: boolean) => {
    if (onPin) {
      onPin(id, isPinned);
    } else if (onNoteUpdate) {
      await onNoteUpdate(id, { pinned: !isPinned });
    }
  }, [onPin, onNoteUpdate]);

  const handleNoteClick = useCallback((note: Note) => {
    if (onNoteClick) {
      onNoteClick(note);
    }
  }, [onNoteClick]);

  const handleShowDetails = useCallback((note: Note, e: React.MouseEvent) => {
    if (onShowDetails) {
      onShowDetails(note, e);
    }
  }, [onShowDetails]);

  const gridClasses = useMemo(() => {
    switch (viewMode) {
      case 'list':
        return 'flex flex-col space-y-3';
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
      case 'grid':
      default:
        return `grid gap-6 ${itemsPerRow === 1 ? 'grid-cols-1' : itemsPerRow === 2 ? 'grid-cols-2' : itemsPerRow === 3 ? 'grid-cols-3' : 'grid-cols-4'}`;
    }
  }, [viewMode, itemsPerRow]);

  if (!rowNotes.length) {
    return (
      <div style={style} className="p-2">
        <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
      </div>
    );
  }

  return (
    <div style={style} className="px-2">
      <div className={gridClasses}>
        {rowNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onNoteClick={handleNoteClick}
            onShowDetails={handleShowDetails}
            onPin={handlePin}
            onDelete={onNoteDelete}
            confirmDelete={null}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

export const VirtualizedNotesGrid = memo(({
  notes,
  viewMode,
  loading = false,
  height = 600,
  onNoteUpdate,
  onNoteDelete,
  onNoteClick,
  onShowDetails,
  itemsPerRow = 3,
  debugMode = false
}: VirtualizedNotesGridProps) => {
  const listRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    metrics,
    startRenderTiming,
    endRenderTiming,
    trackScrollPerformance,
    updateMemoryUsage,
    trackCachePerformance
  } = useVirtualizationMetrics({
    totalItems: notes.length,
    isVirtualized: true,
    debugMode
  });

  const notesCache = useNotesCache({
    maxCacheSize: 100,
    cacheTTL: 15,
    enableIntelligentPreloading: true
  });

  const memoryOptimizer = useMemoryOptimization({
    config: {
      enableLazyLoading: true,
      enableGarbageCollection: true,
      maxConcurrentImages: 8,
      gcInterval: 30,
      memoryThreshold: 60,
    },
    debugMode
  });

  // Calculate dynamic item heights based on view mode
  const getItemSize = useCallback((index: number) => {
    switch (viewMode) {
      case 'list':
        return 120; // Compact list items
      case 'compact':
        return 200; // Smaller cards
      case 'grid':
      default:
        return 280; // Full grid cards
    }
  }, [viewMode]);

  // Calculate items per row based on view mode and container width
  const calculatedItemsPerRow = useMemo(() => {
    if (viewMode === 'list') return 1;
    
    const containerWidth = containerRef.current?.offsetWidth || 1200;
    
    if (viewMode === 'compact') {
      const cardWidth = 240;
      const gap = 16;
      return Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
    }
    
    // Grid mode
    const cardWidth = 320;
    const gap = 24;
    return Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
  }, [viewMode]);

  // Calculate row count for virtualization
  const rowCount = useMemo(() => {
    return Math.ceil(notes.length / calculatedItemsPerRow);
  }, [notes.length, calculatedItemsPerRow]);

  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo((): ItemData => ({
    notes,
    viewMode,
    itemsPerRow: calculatedItemsPerRow,
    onNoteUpdate,
    onNoteDelete,
    onNoteClick,
    onShowDetails,
    onPin: onNoteUpdate ? async (id: string, isPinned: boolean) => {
      await onNoteUpdate(id, { pinned: !isPinned });
    } : undefined
  }), [notes, viewMode, calculatedItemsPerRow, onNoteUpdate, onNoteDelete, onNoteClick, onShowDetails]);

  // Performance monitoring
  useEffect(() => {
    startRenderTiming();
    return () => {
      endRenderTiming();
      updateMemoryUsage();
    };
  }, [notes.length, startRenderTiming, endRenderTiming, updateMemoryUsage]);

  // Track scroll performance
  const handleScroll = useCallback(() => {
    trackScrollPerformance();
  }, [trackScrollPerformance]);

  if (loading && rowCount === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (rowCount === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No notes found</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Advanced Performance Debug Info */}
      {debugMode && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-sm border border-blue-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="font-medium text-blue-900">Rendering</div>
              <div>Time: {metrics.renderTime.toFixed(2)}ms</div>
              <div>FPS: {metrics.frameRate}</div>
              <div>Grade: {metrics.performanceGrade}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-green-900">Memory</div>
              <div>Usage: {memoryOptimizer.getMemoryUsage().toFixed(1)}MB</div>
              <div>Saved: {metrics.memoryReduction}%</div>
              <div>Items: {metrics.visibleItems}/{metrics.totalItems}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-purple-900">Cache</div>
              <div>Hit Rate: {notesCache.stats().hitRate}%</div>
              <div>Size: {notesCache.stats().cacheSize}</div>
              <div>Memory: {notesCache.stats().memoryEstimate}KB</div>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <List
          ref={listRef}
          height={height}
          width="100%"
          itemCount={rowCount}
          itemSize={getItemSize}
          itemData={itemData}
          overscanCount={3}
          onScroll={handleScroll}
        >
          {VirtualizedRow}
        </List>
      </div>

      {/* Memory optimization indicator */}
      {notes.length > 50 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          💡 Virtualized for optimal performance ({Math.round((1 - metrics.visibleItems / metrics.totalItems) * 100)}% memory saved)
        </div>
      )}
    </div>
  );
});

VirtualizedNotesGrid.displayName = 'VirtualizedNotesGrid';