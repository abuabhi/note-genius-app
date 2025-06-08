
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserSubject } from '@/types/subject';
import { FilterHeader } from '@/components/flashcards/filters/FilterHeader';
import { FilterSelectors } from '@/components/flashcards/filters/FilterSelectors';

export interface FlashcardFilters {
  searchQuery: string;
  subjectFilter?: string;
  timeFilter: 'all' | 'week' | 'month' | 'quarter';
  showPinnedOnly: boolean;
  sortBy: 'updated_at' | 'created_at' | 'name' | 'card_count' | 'progress';
  viewMode: 'grid' | 'list';
}

interface AdvancedFlashcardFiltersProps {
  filters: FlashcardFilters;
  onFiltersChange: (filters: FlashcardFilters) => void;
  userSubjects: UserSubject[];
  subjectsLoading: boolean;
  filteredCount: number;
  totalCount: number;
}

const timeFilterLabels = {
  all: 'All time',
  week: 'Last 7 days',
  month: 'Last 30 days',
  quarter: 'Last 90 days',
};

const AdvancedFlashcardFilters = ({
  filters,
  onFiltersChange,
  userSubjects,
  subjectsLoading,
  filteredCount,
  totalCount,
}: AdvancedFlashcardFiltersProps) => {
  const handleFilterChange = (key: keyof FlashcardFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      searchQuery: '',
      timeFilter: 'all',
      showPinnedOnly: false,
      sortBy: 'updated_at',
      viewMode: 'list',
    });
  };

  const activeFilterCount = [
    filters.searchQuery && 'search',
    filters.subjectFilter && 'subject',
    filters.timeFilter !== 'all' && 'time',
    filters.showPinnedOnly && 'pinned',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search flashcard sets..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="pl-10 border-mint-200 focus-visible:ring-mint-400"
          />
        </div>

        {/* Quick Filters */}
        <FilterHeader
          showPinnedOnly={filters.showPinnedOnly}
          activeFilterCount={activeFilterCount}
          onTogglePinned={() => handleFilterChange('showPinnedOnly', !filters.showPinnedOnly)}
          onResetFilters={handleResetFilters}
        >
          <FilterSelectors
            subjectFilter={filters.subjectFilter}
            timeFilter={filters.timeFilter}
            sortBy={filters.sortBy}
            viewMode={filters.viewMode}
            userSubjects={userSubjects}
            subjectsLoading={subjectsLoading}
            onSubjectChange={(value) => handleFilterChange('subjectFilter', value)}
            onTimeChange={(value) => handleFilterChange('timeFilter', value)}
            onSortChange={(value) => handleFilterChange('sortBy', value)}
            onViewModeChange={(value) => handleFilterChange('viewMode', value)}
          />
        </FilterHeader>
      </div>

      {/* Results Summary & Active Filters */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            {filteredCount} of {totalCount} sets
          </span>
          
          {/* Active Filter Tags */}
          <div className="flex gap-1">
            {filters.subjectFilter && (
              <Badge variant="secondary" className="text-xs">
                {filters.subjectFilter}
              </Badge>
            )}
            {filters.timeFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {timeFilterLabels[filters.timeFilter]}
              </Badge>
            )}
            {filters.showPinnedOnly && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                Pinned Only
              </Badge>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdvancedFlashcardFilters;
