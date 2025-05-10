
import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotes } from "@/contexts/NoteContext";
import { Badge } from "@/components/ui/badge";
import { FilterOptions } from "@/contexts/notes/types";

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
          className="relative border-purple-200 hover:bg-purple-50 hover:text-purple-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-purple-100 text-purple-800"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filter Notes</h4>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 px-2 hover:text-purple-700">
                <X className="h-4 w-4 mr-1" /> Clear filters
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Subject</Label>
            <Select
              value={localFilters.category || ""}
              onValueChange={(value) => 
                setLocalFilters({
                  ...localFilters, 
                  category: value === "" ? undefined : value
                })
              }
            >
              <SelectTrigger id="category" className="border-purple-200 focus:ring-purple-400">
                <SelectValue placeholder="Any subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any subject</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date from</Label>
              <Input
                id="dateFrom"
                type="date"
                value={localFilters.dateFrom || ""}
                onChange={(e) => 
                  setLocalFilters({
                    ...localFilters, 
                    dateFrom: e.target.value || undefined
                  })
                }
                className="border-purple-200 focus-visible:ring-purple-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date to</Label>
              <Input
                id="dateTo"
                type="date"
                value={localFilters.dateTo || ""}
                onChange={(e) => 
                  setLocalFilters({
                    ...localFilters, 
                    dateTo: e.target.value || undefined
                  })
                }
                className="border-purple-200 focus-visible:ring-purple-400"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Source type</Label>
            <div className="grid grid-cols-3 gap-2">
              {["manual", "scan", "import"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={localFilters.sourceType?.includes(type as any) || false}
                    onCheckedChange={(checked) => {
                      const types = localFilters.sourceType || [];
                      setLocalFilters({
                        ...localFilters,
                        sourceType: checked
                          ? [...types, type as any]
                          : types.filter(t => t !== type)
                      });
                    }}
                    className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-tags"
                checked={localFilters.hasTags === true}
                onCheckedChange={(checked) => {
                  setLocalFilters({
                    ...localFilters,
                    hasTags: checked === 'indeterminate' ? undefined : checked === true
                  });
                }}
                className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <label
                htmlFor="has-tags"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Has tags
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="no-tags"
                checked={localFilters.hasTags === false}
                onCheckedChange={(checked) => {
                  setLocalFilters({
                    ...localFilters,
                    hasTags: checked === 'indeterminate' ? undefined : checked === false ? false : undefined
                  });
                }}
                className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <label
                htmlFor="no-tags"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                No tags
              </label>
            </div>
          </div>
          
          <Button onClick={handleApplyFilters} className="w-full bg-purple-600 hover:bg-purple-700">
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
