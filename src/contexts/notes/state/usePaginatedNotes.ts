
import { useState, useMemo, useEffect } from 'react';
import { Note } from "@/types/note";
import { paginateNotes } from './filterUtils';

/**
 * Hook to paginate filtered notes
 */
export function usePaginatedNotes(filteredNotes: Note[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [notesPerPage, setNotesPerPage] = useState(12);
  
  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(filteredNotes.length / notesPerPage)), 
    [filteredNotes.length, notesPerPage]
  );
  
  // Adjust current page if it exceeds the new total
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);
  
  // Get current page of notes
  const paginatedNotes = useMemo(() => 
    paginateNotes(filteredNotes, currentPage, notesPerPage),
    [filteredNotes, currentPage, notesPerPage]
  );
  
  return {
    currentPage,
    setCurrentPage,
    notesPerPage,
    setNotesPerPage,
    totalPages,
    paginatedNotes
  };
}
