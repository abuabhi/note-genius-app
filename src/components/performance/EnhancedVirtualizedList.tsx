
import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List, VariableSizeList, ListChildComponentProps } from 'react-window';
import { useBackgroundProcessor } from '@/hooks/performance/useBackgroundProcessor';
import { useMultiLevelCache } from '@/hooks/performance/useMultiLevelCache';

interface EnhancedVirtualizedListProps<T = any> {
  items: T[];
  height: number;
  width?: number | string;
  itemHeight?: number | ((index: number) => number);
  renderItem: (props: ListChildComponentProps & { item: T }) => React.ReactElement;
  className?: string;
  overscan?: number;
  onItemsRendered?: (startIndex: number, endIndex: number) => void;
  enableCache?: boolean;
  cacheKey?: string;
  loadMore?: () => Promise<void>;
  hasNextPage?: boolean;
  isLoading?: boolean;
  threshold?: number;
}

// Memoized item renderer to prevent unnecessary re-renders
const ItemRenderer = memo<{
  index: number;
  style: React.CSSProperties;
  data: {
    items: any[];
    renderItem: any;
    cache: any;
    cacheKey: string;
  };
}>(({ index, style, data }) => {
  const { items, renderItem, cache, cacheKey } = data;
  const item = items[index];
  
  if (!item) {
    return (
      <div style={style} className="flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 h-8 w-full rounded" />
      </div>
    );
  }

  // Check cache for rendered item
  const cachedRender = cache?.get(`${cacheKey}_item_${index}`);
  if (cachedRender) {
    return <div style={style}>{cachedRender}</div>;
  }

  const renderedItem = renderItem({ 
    index, 
    style: {}, // Remove style from item, apply to container
    item,
    isScrolling: false // We'll implement this if needed
  });

  // Cache the rendered item
  if (cache) {
    cache.set(`${cacheKey}_item_${index}`, renderedItem, {
      levels: ['memory'],
      ttl: 5 * 60 * 1000 // 5 minutes
    });
  }

  return <div style={style}>{renderedItem}</div>;
});

ItemRenderer.displayName = 'ItemRenderer';

export const EnhancedVirtualizedList = memo(<T,>({
  items,
  height,
  width = '100%',
  itemHeight = 50,
  renderItem,
  className = "",
  overscan = 5,
  onItemsRendered,
  enableCache = true,
  cacheKey = 'virtualized_list',
  loadMore,
  hasNextPage = false,
  isLoading = false,
  threshold = 5
}: EnhancedVirtualizedListProps<T>) => {
  const listRef = useRef<List | VariableSizeList>(null);
  const { addJob } = useBackgroundProcessor();
  const cache = useMultiLevelCache();
  
  // Use variable size list if itemHeight is a function
  const isVariableSize = typeof itemHeight === 'function';
  const ListComponent = isVariableSize ? VariableSizeList : List;

  // Memoize item data to prevent re-renders
  const itemData = useMemo(() => ({
    items,
    renderItem,
    cache: enableCache ? cache : null,
    cacheKey
  }), [items, renderItem, enableCache ? cache : null, cacheKey]);

  // Handle infinite loading
  const handleItemsRendered = useCallback((startIndex: number, endIndex: number) => {
    onItemsRendered?.(startIndex, endIndex);
    
    // Check if we need to load more items
    if (hasNextPage && !isLoading && loadMore) {
      const shouldLoadMore = endIndex >= items.length - threshold;
      
      if (shouldLoadMore) {
        // Use background processor for loading more items
        addJob('load_more_items', { loadMore }, 'high');
      }
    }
  }, [onItemsRendered, hasNextPage, isLoading, loadMore, items.length, threshold, addJob]);

  // Preload items in background
  useEffect(() => {
    if (enableCache && items.length > 0) {
      addJob('preload_items', {
        items: items.slice(0, Math.min(50, items.length)), // Preload first 50 items
        renderItem,
        cache,
        cacheKey
      }, 'low');
    }
  }, [items, enableCache, addJob, renderItem, cache, cacheKey]);

  // Scroll to item utility
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    listRef.current?.scrollToItem(index, align);
  }, []);

  // Calculate list props
  const listProps = {
    ref: listRef,
    height,
    width,
    itemCount: items.length,
    itemData,
    className,
    overscanCount: overscan,
    onItemsRendered: isVariableSize ? undefined : handleItemsRendered,
    children: ItemRenderer
  };

  return (
    <div className={`virtualized-list-container ${className}`}>
      {isVariableSize ? (
        <VariableSizeList
          {...listProps}
          itemSize={itemHeight as (index: number) => number}
          onItemsRendered={({ startIndex, endIndex }) => 
            handleItemsRendered(startIndex, endIndex)
          }
        />
      ) : (
        <List
          {...listProps}
          itemSize={itemHeight as number}
          onItemsRendered={({ startIndex, endIndex }) => 
            handleItemsRendered(startIndex, endIndex)
          }
        />
      )}
      
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mint-500" />
          <span className="ml-2 text-sm text-gray-600">Loading more...</span>
        </div>
      )}
    </div>
  );
});

EnhancedVirtualizedList.displayName = 'EnhancedVirtualizedList';

// Hook for managing virtualized list state
export const useVirtualizedList = <T,>(
  allItems: T[],
  pageSize: number = 50
) => {
  const [visibleItems, setVisibleItems] = React.useState<T[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  
  const loadMoreItems = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const newItems = allItems.slice(startIndex, endIndex);
    
    setVisibleItems(prev => [...prev, ...newItems]);
    setPage(prev => prev + 1);
    setIsLoading(false);
  }, [allItems, page, pageSize, isLoading]);

  // Initial load
  useEffect(() => {
    if (visibleItems.length === 0 && allItems.length > 0) {
      loadMoreItems();
    }
  }, [allItems.length, visibleItems.length, loadMoreItems]);

  const hasNextPage = page * pageSize < allItems.length;

  return {
    visibleItems,
    isLoading,
    hasNextPage,
    loadMoreItems,
    reset: () => {
      setVisibleItems([]);
      setPage(1);
    }
  };
};
