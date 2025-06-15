
import { FilterMenu } from '@/components/notes/FilterMenu';
import { NoteSorter } from '@/components/notes/NoteSorter';
import { ViewToggle } from './ViewToggle';
import { ViewMode } from '@/hooks/useViewPreferences';
import { NoteSearch } from '@/components/notes/NoteSearch';

interface OptimizedNotesFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const OptimizedNotesFilters = ({ viewMode, onViewModeChange }: OptimizedNotesFiltersProps) => {
  console.log('🔍 OptimizedNotesFilters - Received viewMode prop:', viewMode);

  return (
    <div className="flex items-center justify-between w-full gap-4">
      {/* Left side - Search bar */}
      <div className="flex-1 max-w-md">
        <NoteSearch />
      </div>
      
      {/* Right side - Filters and view controls */}
      <div className="flex items-center gap-3">
        <FilterMenu />
        <NoteSorter />
        <div className="h-4 w-px bg-gray-300" />
        <ViewToggle 
          viewMode={viewMode} 
          onViewModeChange={onViewModeChange}
        />
      </div>
    </div>
  );
};
