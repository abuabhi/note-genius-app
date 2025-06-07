
import { FixedSizeList as List } from 'react-window';
import { memo, forwardRef } from 'react';

interface VirtualizedListProps {
  items: any[];
  height: number;
  itemHeight: number;
  renderItem: ({ index, style }: { index: number; style: any }) => JSX.Element;
  className?: string;
}

export const VirtualizedList = memo(({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  className = "" 
}: VirtualizedListProps) => {
  return (
    <div className={className}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={items}
      >
        {renderItem}
      </List>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// Component for rendering individual list items
export const ListItem = memo(forwardRef<HTMLDivElement, any>(({ 
  index, 
  style, 
  data, 
  children 
}, ref) => (
  <div ref={ref} style={style} className="px-4 py-2 border-b">
    {children}
  </div>
)));

ListItem.displayName = 'ListItem';
