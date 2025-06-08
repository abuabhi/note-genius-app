
import { FilterMenu } from '@/components/notes/FilterMenu';
import { NoteSorter } from '@/components/notes/NoteSorter';
import { ViewToggle } from './ViewToggle';
import { ViewMode } from '@/hooks/useViewPreferences';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { Button } from '@/components/ui/button';

interface OptimizedNotesFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const OptimizedNotesFilters = ({ viewMode, onViewModeChange }: OptimizedNotesFiltersProps) => {
  const { searchTerm, setSearchTerm } = useOptimizedNotes();

  console.log('🔍 OptimizedNotesFilters - Received viewMode prop:', viewMode);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Enhanced Search Input */}
      <div className="flex-1 relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-focus-within:text-mint-500" />
        <Input
          type="text"
          placeholder="Search your notes..."
          value={searchTerm}
          onChange={(e) => {
            console.log('🔍 Search input changed:', e.target.value);
            setSearchTerm(e.target.value);
          }}
          className="pl-10 pr-10 bg-white/90 backdrop-blur-sm border-mint-200/60 focus:border-mint-400 focus:ring-2 focus:ring-mint-200/50 transition-all duration-200 rounded-lg h-11 text-gray-700 placeholder:text-gray-400"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Enhanced Filter Controls */}
      <div className="flex items-center gap-2">
        <FilterMenu />
        <NoteSorter />
        <ViewToggle 
          viewMode={viewMode} 
          onViewModeChange={onViewModeChange}
        />
      </div>
    </div>
  );
};
