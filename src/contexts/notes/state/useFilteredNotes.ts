
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
    // Add debugging for subject filtering
    if (filterOptions.subjectId) {
      console.log(`Filtering by subject ID: ${filterOptions.subjectId}`);
      // Count how many notes have this subject_id
      const count = notes.filter(note => note.subject_id === filterOptions.subjectId).length;
      console.log(`Notes with subject_id=${filterOptions.subjectId}: ${count} out of ${notes.length} total notes`);
    }
    
    // First filter the notes
    const filtered = filterNotes(notes, searchTerm, filterOptions, showArchived);
    
    // Then sort them
    return sortNotes(filtered, sortType as any);
  }, [notes, searchTerm, sortType, filterOptions, showArchived]);
}
