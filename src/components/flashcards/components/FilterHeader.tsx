
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Filter, Users } from 'lucide-react';

interface FilterHeaderProps {
  totalSets: number;
  activeFilterCount: number;
}

export const FilterHeader = ({ totalSets, activeFilterCount }: FilterHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFilterCount} active
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{totalSets} sets</span>
      </div>
    </div>
  );
};
