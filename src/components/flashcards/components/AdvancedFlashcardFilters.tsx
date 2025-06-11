
import React from "react";
import { Search, Filter, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FilterHeader } from "./FilterHeader";
import { useUserSubjects } from "@/hooks/useUserSubjects";

export interface FlashcardFilters {
  searchQuery: string;
  subjectFilter: string;
  difficultyFilter: string;
  progressFilter: string;
  sortBy: string;
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
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all' && value !== false && value !== 'grid' && value !== 'updated_at' && value !== 'desc'
  ).length;

  const updateFilter = (key: keyof FlashcardFilters, value: any) => {
    console.log('🔍 Filter updated:', key, value);
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      subjectFilter: 'all',
      difficultyFilter: 'all',
      progressFilter: 'all',
      sortBy: 'updated_at',
      sortOrder: 'desc',
      viewMode: filters.viewMode,
      showPinnedOnly: false
    });
  };

  return (
    <div className="space-y-4">
      <FilterHeader totalSets={totalSets} activeFilterCount={activeFilterCount} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search flashcard sets..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Subject Filter - Updated to use dynamic user subjects */}
        <Select 
          value={filters.subjectFilter} 
          onValueChange={(value) => updateFilter('subjectFilter', value)}
          disabled={subjectsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject.id} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty Filter */}
        <Select value={filters.difficultyFilter} onValueChange={(value) => updateFilter('difficultyFilter', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger>
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Recently Updated</SelectItem>
            <SelectItem value="created_at">Recently Created</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="card_count">Card Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters & Clear */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.searchQuery && (
              <Badge variant="secondary">
                Search: {filters.searchQuery}
              </Badge>
            )}
            {filters.subjectFilter !== 'all' && (
              <Badge variant="secondary">
                Subject: {filters.subjectFilter}
              </Badge>
            )}
            {filters.showPinnedOnly && (
              <Badge variant="secondary">
                Pinned Only
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
