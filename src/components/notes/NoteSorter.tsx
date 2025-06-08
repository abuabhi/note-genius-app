
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, Calendar, CalendarDays, AlphabeticalVariant } from 'lucide-react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

export const NoteSorter = () => {
  const { sortType, setSortType } = useOptimizedNotes();

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: CalendarDays },
    { value: 'oldest', label: 'Oldest First', icon: Calendar },
    { value: 'alphabetical', label: 'Alphabetical', icon: AlphabeticalVariant },
  ];

  const currentSort = sortOptions.find(option => option.value === sortType);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          {currentSort?.label || 'Sort'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setSortType(option.value)}
              className={`flex items-center gap-2 ${
                sortType === option.value ? 'bg-accent' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
