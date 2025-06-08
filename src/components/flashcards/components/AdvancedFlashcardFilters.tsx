
import { useState } from 'react';
import { Search, Filter, Calendar, Star, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { UserSubject } from '@/types/subject';

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

const AdvancedFlashcardFilters = ({
  filters,
  onFiltersChange,
  userSubjects,
  subjectsLoading,
  filteredCount,
  totalCount,
}: AdvancedFlashcardFiltersProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

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
    setIsAdvancedOpen(false);
  };

  const activeFilterCount = [
    filters.searchQuery && 'search',
    filters.subjectFilter && 'subject',
    filters.timeFilter !== 'all' && 'time',
    filters.showPinnedOnly && 'pinned',
  ].filter(Boolean).length;

  const timeFilterLabels = {
    all: 'All time',
    week: 'Last 7 days',
    month: 'Last 30 days',
    quarter: 'Last 90 days',
  };

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
        <div className="flex gap-2">
          {/* Pinned Toggle */}
          <Button
            variant={filters.showPinnedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('showPinnedOnly', !filters.showPinnedOnly)}
            className={filters.showPinnedOnly ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          >
            <Star className={`h-4 w-4 mr-1 ${filters.showPinnedOnly ? 'fill-current' : ''}`} />
            Pinned
          </Button>

          {/* Advanced Filters */}
          <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-mint-500">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Advanced Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      className="h-8 px-2"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>

                {/* Subject Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select
                    value={filters.subjectFilter || "all_subjects"}
                    onValueChange={(value) =>
                      handleFilterChange('subjectFilter', value === "all_subjects" ? undefined : value)
                    }
                    disabled={subjectsLoading}
                  >
                    <SelectTrigger className="border-mint-200">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_subjects">All subjects</SelectItem>
                      {userSubjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select
                    value={filters.timeFilter}
                    onValueChange={(value) => handleFilterChange('timeFilter', value)}
                  >
                    <SelectTrigger className="border-mint-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(timeFilterLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort by</label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger className="border-mint-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated_at">Recently Updated</SelectItem>
                      <SelectItem value="created_at">Recently Created</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="card_count">Card Count</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">View</label>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('viewMode', 'list')}
                      className="flex-1"
                    >
                      List
                    </Button>
                    <Button
                      variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('viewMode', 'grid')}
                      className="flex-1"
                    >
                      Grid
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
