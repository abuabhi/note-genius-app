
import React from 'react';

interface NotesCounterProps {
  currentCount: number;
  totalCount: number;
  shouldVirtualize: boolean;
}

export const NotesCounter = ({
  currentCount,
  totalCount,
  shouldVirtualize
}: NotesCounterProps) => {
  if (totalCount === 0) return null;

  return (
    <div className="text-center text-sm text-gray-500 py-4">
      <div className="flex items-center justify-center gap-2">
        <span>
          {currentCount === totalCount 
            ? `${totalCount} note${totalCount === 1 ? '' : 's'}` 
            : `${currentCount} of ${totalCount} notes`
          }
        </span>
        {shouldVirtualize && (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
            Optimized Rendering
          </span>
        )}
      </div>
    </div>
  );
};
