
import { Button } from "@/components/ui/button";
import { FilterOptions } from "@/contexts/notes/types";
import { X } from "lucide-react";
import { CategoryFilter } from "./CategoryFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { SourceTypeFilter } from "./SourceTypeFilter";
import { TagsFilter } from "./TagsFilter";

interface FilterMenuContentProps {
  localFilters: FilterOptions;
  setLocalFilters: (filters: FilterOptions) => void;
  availableCategories: string[];
  handleApplyFilters: () => void;
  handleClearFilters: () => void;
  activeFilterCount: number;
}

export const FilterMenuContent = ({
  localFilters,
  setLocalFilters,
  availableCategories,
  handleApplyFilters,
  handleClearFilters,
  activeFilterCount
}: FilterMenuContentProps) => {
  // Category filter handler
  const handleCategoryChange = (category: string | undefined) => {
    setLocalFilters({
      ...localFilters,
      category
    });
  };

  // Date filter handlers
  const handleDateFromChange = (dateFrom: string | undefined) => {
    setLocalFilters({
      ...localFilters,
      dateFrom
    });
  };

  const handleDateToChange = (dateTo: string | undefined) => {
    setLocalFilters({
      ...localFilters,
      dateTo
    });
  };

  // Source type filter handler - updated to match the expected interface
  const handleSourceTypeChange = (sourceType: ('manual' | 'scan' | 'import')[]) => {
    setLocalFilters({
      ...localFilters,
      sourceType
    });
  };

  // Tags filter handler
  const handleHasTagsChange = (hasTags: boolean | undefined) => {
    setLocalFilters({
      ...localFilters,
      hasTags
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filter Notes</h4>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 px-2 hover:text-purple-700">
            <X className="h-4 w-4 mr-1" /> Clear filters
          </Button>
        )}
      </div>
      
      <CategoryFilter 
        category={localFilters.category} 
        availableCategories={availableCategories}
        onCategoryChange={handleCategoryChange}
      />
      
      <DateRangeFilter
        dateFrom={localFilters.dateFrom}
        dateTo={localFilters.dateTo}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
      />
      
      <SourceTypeFilter
        sourceType={localFilters.sourceType}
        onSourceTypeChange={handleSourceTypeChange}
      />
      
      <TagsFilter
        hasTags={localFilters.hasTags}
        onHasTagsChange={handleHasTagsChange}
      />
      
      <Button onClick={handleApplyFilters} className="w-full bg-purple-600 hover:bg-purple-700">
        Apply Filters
      </Button>
    </div>
  );
};
