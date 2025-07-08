import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

export const UniversalFilters: React.FC<UniversalFiltersProps> = ({
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
  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-mint-200 focus:border-mint-500"
            disabled={isLoading}
          />
        </div>
        
        {/* Subject Filter */}
        <Select 
          value={subject} 
          onValueChange={onSubjectChange} 
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
        <Select value={sort} onValueChange={onSortChange} disabled={isLoading}>
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
              onCheckedChange={onShowArchivedChange}
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
                  onClick={() => onSearchChange('')}
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
                  onClick={() => onSubjectChange('all')}
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
                  onClick={() => onShowArchivedChange?.(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {/* Clear All Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};