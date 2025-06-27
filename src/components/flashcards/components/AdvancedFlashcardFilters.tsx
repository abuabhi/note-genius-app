
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Grid, List, SortAsc, SortDesc } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FlashcardFilters {
  searchQuery: string;
  subjectFilter: string;
  difficultyFilter: string;
  progressFilter: string;
  sortBy: 'name' | 'created_at' | 'updated_at' | 'card_count';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  showPinnedOnly: boolean;
}

interface AdvancedFlashcardFiltersProps {
  filters: FlashcardFilters;
  onFiltersChange: (filters: FlashcardFilters) => void;
  totalSets: number;
  hideViewMode?: boolean;
}

export const AdvancedFlashcardFilters = ({
  filters,
  onFiltersChange,
  totalSets,
  hideViewMode = false
}: AdvancedFlashcardFiltersProps) => {
  const updateFilter = (key: keyof FlashcardFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      subjectFilter: 'all',
      difficultyFilter: 'all',
      progressFilter: 'all',
      sortBy: 'updated_at',
      sortOrder: 'desc',
      viewMode: 'grid',
      showPinnedOnly: false
    });
  };

  const hasActiveFilters = filters.searchQuery || 
                          filters.subjectFilter !== 'all' || 
                          filters.difficultyFilter !== 'all' || 
                          filters.progressFilter !== 'all' ||
                          filters.showPinnedOnly;

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search flashcard sets..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-sm">
            {totalSets} sets
          </Badge>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Subject Filter */}
          <div className="min-w-[140px]">
            <Select
              value={filters.subjectFilter}
              onValueChange={(value) => updateFilter('subjectFilter', value)}
            >
              <SelectTrigger className="relative z-50">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border shadow-lg">
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div className="min-w-[140px]">
            <Select
              value={filters.difficultyFilter}
              onValueChange={(value) => updateFilter('difficultyFilter', value)}
            >
              <SelectTrigger className="relative z-50">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border shadow-lg">
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="min-w-[140px]">
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-');
                updateFilter('sortBy', sortBy);
                updateFilter('sortOrder', sortOrder);
              }}
            >
              <SelectTrigger className="relative z-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border shadow-lg">
                <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
                <SelectItem value="created_at-desc">Recently Created</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="card_count-desc">Most Cards</SelectItem>
                <SelectItem value="card_count-asc">Fewest Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Mode Toggle */}
        {!hideViewMode && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilter('viewMode', 'grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => updateFilter('viewMode', 'list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
