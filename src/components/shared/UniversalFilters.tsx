import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SimpleSearchInput } from './SimpleSearchInput';

interface Subject {
  id: string;
  name: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface UniversalFiltersProps {
  // Filter values
  search: string;
  subject: string;
  sort: string;
  showArchived?: boolean;
  
  // Setters
  onSearchChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onShowArchivedChange?: (value: boolean) => void;
  
  // Configuration
  subjects: Subject[];
  sortOptions: SortOption[];
  searchPlaceholder?: string;
  enableArchived?: boolean;
  
  // State
  isLoading?: boolean;
  totalCount?: number;
  
  // Computed
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onClearFilters: () => void;
}

export const UniversalFilters: React.FC<UniversalFiltersProps> = memo(({
  search,
  subject,
  sort,
  showArchived = false,
  onSearchChange,
  onSubjectChange,
  onSortChange,
  onShowArchivedChange,
  subjects,
  sortOptions,
  searchPlaceholder = "Search...",
  enableArchived = false,
  isLoading = false,
  totalCount,
  hasActiveFilters,
  activeFilterCount,
  onClearFilters
}) => {
  console.log('🌍 [UNIVERSAL FILTERS] Component rendering with props:', {
    search,
    subject,
    sort,
    subjects: subjects?.map(s => s.name) || [],
    sortOptions: sortOptions?.map(s => s.label) || [],
    hasActiveFilters,
    activeFilterCount,
    totalCount
  });

  // Memoized handlers to prevent re-renders
  const handleSearchChange = useCallback((value: string) => {
    console.log('🔍 [UNIVERSAL FILTERS] Search changing to:', value);
    onSearchChange(value);
  }, [onSearchChange]);

  const handleSubjectChange = useCallback((value: string) => {
    console.log('📚 [UNIVERSAL FILTERS] Subject changing from:', subject, 'to:', value);
    console.log('📚 [UNIVERSAL FILTERS] Available subjects:', subjects.map(s => s.name));
    console.log('📚 [UNIVERSAL FILTERS] onSubjectChange function:', typeof onSubjectChange);
    onSubjectChange(value);
    console.log('📚 [UNIVERSAL FILTERS] Subject change handler called');
  }, [onSubjectChange, subject, subjects]);

  const handleSortChange = useCallback((value: string) => {
    console.log('🔀 [UNIVERSAL FILTERS] Sort changing to:', value);
    onSortChange(value);
  }, [onSortChange]);

  const handleShowArchivedChange = useCallback((value: boolean) => {
    onShowArchivedChange?.(value);
  }, [onShowArchivedChange]);

  const handleClearFilters = useCallback(() => {
    onClearFilters();
  }, [onClearFilters]);
  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <SimpleSearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="border-mint-200 focus:border-mint-500"
          />
        </div>
        
        {/* Subject Filter */}
        <Select 
          value={subject} 
          onValueChange={handleSubjectChange} 
          disabled={isLoading}
        >
          <SelectTrigger className="w-full lg:w-48 border-mint-200">
            <SelectValue placeholder="Filter by Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subj) => (
              <SelectItem key={subj.id} value={subj.name}>
                {subj.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Options */}
        <Select value={sort} onValueChange={handleSortChange} disabled={isLoading}>
          <SelectTrigger className="w-full lg:w-48 border-mint-200">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Show Archived Toggle */}
        {enableArchived && onShowArchivedChange && (
          <div className="flex items-center space-x-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={handleShowArchivedChange}
              disabled={isLoading}
            />
            <Label htmlFor="show-archived" className="text-sm text-gray-600">
              Show Archived
            </Label>
          </div>
        )}
      </div>

      {/* Results Summary and Active Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Results Count */}
        {totalCount !== undefined && (
          <div className="text-sm text-gray-600 font-medium">
            {totalCount} result{totalCount === 1 ? '' : 's'}
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">
              Filters ({activeFilterCount}):
            </span>
            
            {/* Search Filter Badge */}
            {search && (
              <Badge variant="secondary" className="bg-mint-100 text-mint-800">
                "{search}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-mint-200"
                  onClick={() => handleSearchChange('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {/* Subject Filter Badge */}
            {subject && subject !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {subject}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                  onClick={() => handleSubjectChange('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {/* Archived Filter Badge */}
            {enableArchived && showArchived && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Show Archived
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-orange-200"
                  onClick={() => handleShowArchivedChange(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {/* Clear All Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

UniversalFilters.displayName = 'UniversalFilters';