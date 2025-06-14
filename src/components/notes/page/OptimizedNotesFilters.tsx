
import { FilterMenu } from '@/components/notes/FilterMenu';
import { NoteSorter } from '@/components/notes/NoteSorter';
import { ViewToggle } from './ViewToggle';
import { ViewMode } from '@/hooks/useViewPreferences';

interface OptimizedNotesFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const OptimizedNotesFilters = ({ viewMode, onViewModeChange }: OptimizedNotesFiltersProps) => {
  console.log('🔍 OptimizedNotesFilters - Received viewMode prop:', viewMode);

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left side - Subject filters */}
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-medium text-gray-700">Filter & Sort</h3>
        <div className="flex items-center gap-2">
          <FilterMenu />
          <NoteSorter />
        </div>
      </div>
      
      {/* Right side - View toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">View</span>
        <ViewToggle 
          viewMode={viewMode} 
          onViewModeChange={onViewModeChange}
        />
      </div>
    </div>
  );
};
