
import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/contexts/NoteContext";
import { FilterOptions } from "@/contexts/notes/types";
import { FilterMenuContent } from "./filters/FilterMenuContent";

export const FilterMenu = () => {
  const {
    filterOptions,
    setFilterOptions,
    resetFilters,
    availableCategories = [],
  } = useNotes();
  
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filterOptions);
  
  // Update local filters when context filters change
  useEffect(() => {
    setLocalFilters(filterOptions);
  }, [filterOptions]);

  const handleApplyFilters = () => {
    setFilterOptions(localFilters);
    setOpen(false);
  };
  
  const handleClearFilters = () => {
    resetFilters();
    setLocalFilters({});
    setOpen(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(filterOptions).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '';
    }).length;
  };
  
  const activeFilterCount = getActiveFilterCount();
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative border-mint-200 hover:bg-mint-50 hover:text-mint-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-mint-100 text-mint-800"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-mint-200 bg-white">
        <FilterMenuContent
          localFilters={localFilters}
          setLocalFilters={setLocalFilters}
          availableCategories={availableCategories}
          handleApplyFilters={handleApplyFilters}
          handleClearFilters={handleClearFilters}
          activeFilterCount={activeFilterCount}
        />
      </PopoverContent>
    </Popover>
  );
};
