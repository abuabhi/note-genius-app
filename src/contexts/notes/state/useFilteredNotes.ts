
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
      console.log(`useFilteredNotes - Filtering by subject ID: ${filterOptions.subjectId}`);
      
      // Count how many notes have this subject_id
      const totalNotes = notes.length;
      const matchingNotes = notes.filter(note => note.subject_id === filterOptions.subjectId).length;
      
      console.log(`Notes with subject_id=${filterOptions.subjectId}: ${matchingNotes} out of ${totalNotes} total notes`);
      
      // List all unique subject IDs in the notes
      const uniqueSubjectIds = [...new Set(notes.filter(note => note.subject_id).map(note => note.subject_id))];
      console.log(`Unique subject IDs in notes: ${uniqueSubjectIds.join(', ')}`);
      
      // Log all notes and their subject IDs for debugging
      notes.forEach(note => {
        console.log(`Note "${note.title}" has subject_id: ${note.subject_id || 'none'}`);
      });
    }
    
    // First filter the notes
    const filtered = filterNotes(notes, searchTerm, filterOptions, showArchived);
    
    // Log filtered notes count
    console.log(`Filtered notes: ${filtered.length} out of ${notes.length} total notes`);
    
    // Then sort them
    return sortNotes(filtered, sortType as any);
  }, [notes, searchTerm, sortType, filterOptions, showArchived]);
}
