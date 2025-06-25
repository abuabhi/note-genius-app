
import { useMemo, useCallback, useState, useRef } from 'react';
import { Note } from '@/types/note';

interface VirtualizedNotesConfig {
  itemHeight: number;
  itemsPerRow: number;
  containerHeight: number;
  overscan: number;
  enabled: boolean;
}

interface VirtualizedNotesReturn {
  virtualizedConfig: VirtualizedNotesConfig;
  shouldVirtualize: boolean;
  getItemSize: (index: number) => number;
  getItemData: () => {
    notes: Note[];
    itemsPerRow: number;
    onPin: (id: string, isPinned: boolean) => void;
    onDelete: (id: string) => Promise<void>;
    onNoteClick: (note: Note) => void;
    onShowDetails: (note: Note, e: React.MouseEvent) => void;
    viewMode: 'grid' | 'list';
  };
  resetScrollPosition: () => void;
}

interface UseVirtualizedNotesProps {
  notes: Note[];
  viewMode: 'grid' | 'list';
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  onNoteClick: (note: Note) => void;
  onShowDetails: (note: Note, e: React.MouseEvent) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  virtualizationThreshold?: number;
}

export const useVirtualizedNotes = ({
  notes,
  viewMode,
  onPin,
  onDelete,
  onNoteClick,
  onShowDetails,
  containerRef,
  virtualizationThreshold = 50,
}: UseVirtualizedNotesProps): VirtualizedNotesReturn => {
  const listRef = useRef<any>(null);
  const [containerHeight] = useState(600); // Default height, can be made dynamic

  // Determine if we should virtualize based on note count
  const shouldVirtualize = useMemo(() => {
    return notes.length > virtualizationThreshold;
  }, [notes.length, virtualizationThreshold]);

  // Calculate layout based on view mode
  const layoutConfig = useMemo(() => {
    if (viewMode === 'list') {
      return {
        itemHeight: 120, // Height for compact list cards
        itemsPerRow: 1,
        overscan: 5,
      };
    }
    
    // Grid mode - calculate items per row based on container width
    // Assuming 320px card width + 16px gap
    const containerWidth = containerRef?.current?.offsetWidth || 1200;
    const cardWidth = 320;
    const gap = 16;
    const itemsPerRow = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
    
    return {
      itemHeight: 280, // Height for grid cards
      itemsPerRow,
      overscan: 2,
    };
  }, [viewMode, containerRef]);

  // Virtualization configuration
  const virtualizedConfig = useMemo<VirtualizedNotesConfig>(() => ({
    itemHeight: layoutConfig.itemHeight,
    itemsPerRow: layoutConfig.itemsPerRow,
    containerHeight,
    overscan: layoutConfig.overscan,
    enabled: shouldVirtualize,
  }), [layoutConfig, containerHeight, shouldVirtualize]);

  // Calculate item size for variable height (if needed in future)
  const getItemSize = useCallback((index: number) => {
    return virtualizedConfig.itemHeight;
  }, [virtualizedConfig.itemHeight]);

  // Prepare data for virtual list
  const getItemData = useCallback(() => ({
    notes,
    itemsPerRow: virtualizedConfig.itemsPerRow,
    onPin,
    onDelete,
    onNoteClick,
    onShowDetails,
    viewMode,
  }), [notes, virtualizedConfig.itemsPerRow, onPin, onDelete, onNoteClick, onShowDetails, viewMode]);

  // Reset scroll position (useful when filters change)
  const resetScrollPosition = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, []);

  return {
    virtualizedConfig,
    shouldVirtualize,
    getItemSize,
    getItemData,
    resetScrollPosition,
  };
};

export default useVirtualizedNotes;
