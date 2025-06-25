
import React, { memo } from 'react';

interface NotesCounterProps {
  currentCount: number;
  totalCount: number;
  shouldVirtualize: boolean;
}

export const NotesCounter = memo(({
  currentCount,
  totalCount,
  shouldVirtualize
}: NotesCounterProps) => {
  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="text-center text-sm text-gray-500">
      Showing {currentCount} of {totalCount} notes
      {shouldVirtualize && (
        <span className="ml-2 text-mint-600">⚡ Virtualized</span>
      )}
    </div>
  );
});

NotesCounter.displayName = 'NotesCounter';
