
import React from 'react';

interface FancyNotesCounterProps {
  currentCount: number;
  totalCount: number;
  hasFilters?: boolean;
}

export const FancyNotesCounter = ({ 
  currentCount, 
  totalCount, 
  hasFilters = false 
}: FancyNotesCounterProps) => {
  if (totalCount === 0) return null;

  const isFiltered = hasFilters && currentCount !== totalCount;
  
  return (
    <div className="flex items-center justify-center py-3">
      <div className="text-sm text-gray-600">
        {isFiltered ? (
          <span>{currentCount} of {totalCount} notes</span>
        ) : (
          <span>{currentCount} {currentCount === 1 ? 'note' : 'notes'}</span>
        )}
      </div>
    </div>
  );
};
