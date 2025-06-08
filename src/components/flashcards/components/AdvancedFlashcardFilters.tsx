
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterHeader } from "../filters/FilterHeader";
import { FilterSelectors } from "../filters/FilterSelectors";
import { Search, SlidersHorizontal, X } from "lucide-react";

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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FlashcardFilters, value: any) => {
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
      viewMode: filters.viewMode, // Preserve view mode
      showPinnedOnly: false
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.subjectFilter !== 'all') count++;
    if (filters.difficultyFilter !== 'all') count++;
    if (filters.progressFilter !== 'all') count++;
    if (filters.showPinnedOnly) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-4">
      {/* Search and Basic Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search flashcard sets..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4">
            <FilterHeader 
              totalSets={totalSets}
              activeFilterCount={activeFilterCount}
            />
            <FilterSelectors
              filters={filters}
              onFiltersChange={onFiltersChange}
              hideViewMode={hideViewMode}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
