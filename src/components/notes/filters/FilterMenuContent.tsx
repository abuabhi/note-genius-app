
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
  const handleDateFromChange = (dateString: string | undefined) => {
    setLocalFilters({
      ...localFilters,
      dateFrom: dateString ? new Date(dateString) : undefined
    });
  };

  const handleDateToChange = (dateString: string | undefined) => {
    setLocalFilters({
      ...localFilters,
      dateTo: dateString ? new Date(dateString) : undefined
    });
  };

  // Source type filter handler
  const handleSourceTypeChange = (sourceType: ('manual' | 'scan' | 'import')[]) => {
    setLocalFilters({
      ...localFilters,
      sourceType: sourceType as any
    });
  };

  // Tags filter handler
  const handleHasTagsChange = (hasTags: boolean | undefined) => {
    setLocalFilters({
      ...localFilters,
      hasTags
    });
  };

  // Convert the Date objects to strings for the DateRangeFilter component
  const dateFromString = localFilters.dateFrom instanceof Date 
    ? localFilters.dateFrom.toISOString().split('T')[0]
    : undefined;
    
  const dateToString = localFilters.dateTo instanceof Date
    ? localFilters.dateTo.toISOString().split('T')[0]
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-mint-800">Filter Notes</h4>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 px-2 hover:text-mint-700">
            <X className="h-4 w-4 mr-1" /> Clear filters
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Subject and Date in same section */}
        <div className="space-y-3">
          <CategoryFilter 
            category={localFilters.category} 
            availableCategories={availableCategories}
            onCategoryChange={handleCategoryChange}
          />
          
          <DateRangeFilter
            dateFrom={dateFromString}
            dateTo={dateToString}
            onDateFromChange={handleDateFromChange}
            onDateToChange={handleDateToChange}
          />
        </div>
        
        <SourceTypeFilter
          sourceType={Array.isArray(localFilters.sourceType) ? 
            localFilters.sourceType as ('manual' | 'scan' | 'import')[] :
            localFilters.sourceType ? [localFilters.sourceType as 'manual' | 'scan' | 'import'] : []
          }
          onSourceTypeChange={handleSourceTypeChange}
        />
        
        <TagsFilter
          hasTags={localFilters.hasTags}
          onHasTagsChange={handleHasTagsChange}
        />
      </div>
      
      <Button onClick={handleApplyFilters} className="w-full bg-mint-600 hover:bg-mint-700">
        Apply Filters
      </Button>
    </div>
  );
};
