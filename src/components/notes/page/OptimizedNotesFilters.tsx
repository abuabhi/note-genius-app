
import { FilterMenu } from '@/components/notes/FilterMenu';
import { NoteSorter } from '@/components/notes/NoteSorter';
import { ViewToggle } from './ViewToggle';
import { ViewMode } from '@/hooks/useViewPreferences';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

interface OptimizedNotesFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const OptimizedNotesFilters = ({ viewMode, onViewModeChange }: OptimizedNotesFiltersProps) => {
  const { searchTerm, setSearchTerm } = useOptimizedNotes();

  console.log('🔍 OptimizedNotesFilters - Received viewMode prop:', viewMode);

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Search Input - Takes up remaining space */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => {
            console.log('🔍 Search input changed:', e.target.value);
            setSearchTerm(e.target.value);
          }}
          className="pl-10 bg-white/80 backdrop-blur-sm border-mint-200 focus:border-mint-400 transition-colors"
        />
      </div>
      
      {/* Filter Menu */}
      <FilterMenu />
      
      {/* Note Sorter */}
      <NoteSorter />
      
      {/* View Toggle */}
      <ViewToggle 
        viewMode={viewMode} 
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
};
