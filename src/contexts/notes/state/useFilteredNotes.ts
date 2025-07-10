
import { useMemo } from 'react';
import { Note } from "@/types/note";
import { FilterOptions } from "./types";
import { filterNotes, sortNotes } from './filterUtils';

/**
 * Hook to filter and sort notes based on filters and sort type
 */
export function useFilteredNotes(
  notes: Note[],
  searchTerm: string,
  sortType: string,
  filterOptions: FilterOptions,
  showArchived: boolean
) {
  return useMemo(() => {
    // First filter the notes
    const filtered = filterNotes(notes, searchTerm, filterOptions, showArchived);
    
    // Then sort them
    return sortNotes(filtered, sortType as any);
  }, [notes, searchTerm, sortType, filterOptions, showArchived]);
}
