
import React, { memo } from 'react';
import { FilterMenu } from '@/components/notes/FilterMenu';
import { NoteSorter } from '@/components/notes/NoteSorter';
import { NoteSearch } from '@/components/notes/NoteSearch';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

export const OptimizedNotesFilters = memo(() => {
  const { notes, totalCount } = useOptimizedNotes();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Search bar */}
        <div className="flex-1 max-w-md">
          <NoteSearch />
        </div>
        
        {/* Center - Results counter */}
        <div className="flex-shrink-0 text-sm text-gray-600 font-medium">
          {notes.length} of {totalCount} notes
        </div>
        
        {/* Right side - Filters and controls */}
        <div className="flex items-center gap-3">
          <FilterMenu />
          <NoteSorter />
        </div>
      </div>
    </div>
  );
});

OptimizedNotesFilters.displayName = 'OptimizedNotesFilters';
