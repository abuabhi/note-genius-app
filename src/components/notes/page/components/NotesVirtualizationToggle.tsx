
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';

interface NotesVirtualizationToggleProps {
  useVirtualization: boolean;
  shouldVirtualize: boolean;
  noteCount: number;
  threshold: number;
  renderTime: number;
  onToggle: () => void;
}

export const NotesVirtualizationToggle = memo(({
  useVirtualization,
  shouldVirtualize,
  noteCount,
  threshold,
  renderTime,
  onToggle
}: NotesVirtualizationToggleProps) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
      <div className="flex items-center justify-between">
        <span>Virtualization: {shouldVirtualize ? '✅ Active' : '❌ Disabled'}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
        >
          Toggle Virtualization
        </Button>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Notes: {noteCount} | Threshold: {threshold} | Render: {renderTime.toFixed(2)}ms
      </div>
    </div>
  );
});

NotesVirtualizationToggle.displayName = 'NotesVirtualizationToggle';
