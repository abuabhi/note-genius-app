
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Grid2x2, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlashcardFilters } from "../components/AdvancedFlashcardFilters";

interface FilterSelectorsProps {
  filters: FlashcardFilters;
  onFiltersChange: (filters: FlashcardFilters) => void;
  hideViewMode?: boolean;
}

export const FilterSelectors = ({ 
  filters, 
  onFiltersChange,
  hideViewMode = false
}: FilterSelectorsProps) => {
  const updateFilter = (key: keyof FlashcardFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Subject Filter */}
      <div className="space-y-2">
        <Label>Subject</Label>
        <Select value={filters.subjectFilter} onValueChange={(value) => updateFilter('subjectFilter', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="mathematics">Mathematics</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="history">History</SelectItem>
            <SelectItem value="literature">Literature</SelectItem>
            <SelectItem value="languages">Languages</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <Label>Difficulty</Label>
        <Select value={filters.difficultyFilter} onValueChange={(value) => updateFilter('difficultyFilter', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Progress Filter */}
      <div className="space-y-2">
        <Label>Progress</Label>
        <Select value={filters.progressFilter} onValueChange={(value) => updateFilter('progressFilter', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All progress" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Progress</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Last Updated</SelectItem>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="title">Name (A-Z)</SelectItem>
            <SelectItem value="card_count">Card Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Mode - Only show if not hidden */}
      {!hideViewMode && (
        <div className="space-y-2">
          <Label>View Mode</Label>
          <div className="flex gap-2">
            <Button
              variant={filters.viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('viewMode', 'grid')}
              className="flex-1"
            >
              <Grid2x2 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={filters.viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('viewMode', 'list')}
              className="flex-1"
            >
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      )}

      {/* Show Pinned Only */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="pinned-only"
            checked={filters.showPinnedOnly}
            onCheckedChange={(checked) => updateFilter('showPinnedOnly', checked)}
          />
          <Label htmlFor="pinned-only">Pinned Only</Label>
        </div>
      </div>
    </div>
  );
};
