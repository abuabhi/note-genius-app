
import { useState } from 'react';
import { Filter, Star, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FilterHeaderProps {
  showPinnedOnly: boolean;
  activeFilterCount: number;
  onTogglePinned: () => void;
  onResetFilters: () => void;
  children: React.ReactNode;
}

export const FilterHeader = ({
  showPinnedOnly,
  activeFilterCount,
  onTogglePinned,
  onResetFilters,
  children,
}: FilterHeaderProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="flex gap-2">
      {/* Pinned Toggle */}
      <Button
        variant={showPinnedOnly ? 'default' : 'outline'}
        size="sm"
        onClick={onTogglePinned}
        className={showPinnedOnly ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
      >
        <Star className={`h-4 w-4 mr-1 ${showPinnedOnly ? 'fill-current' : ''}`} />
        Pinned
      </Button>

      {/* Advanced Filters */}
      <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-mint-500">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Advanced Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onResetFilters();
                    setIsAdvancedOpen(false);
                  }}
                  className="h-8 px-2"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
            {children}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
