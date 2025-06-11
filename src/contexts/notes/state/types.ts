
import { Note } from "@/types/note";

// Types moved from the main types.ts
export type SortType = 'newest' | 'oldest' | 'alphabetical' | 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'subject';

/**
 * FilterOptions for notes domain - uses 'subject' for note categorization
 * Note: This is distinct from flashcard/quiz 'categories' which are separate domain concepts
 */
export interface FilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  subject?: string; // Note academic subject filtering
  sourceType?: 'manual' | 'scan' | 'import' | ('manual' | 'scan' | 'import')[];
  hasTags?: boolean;
  tags?: string[];
  subjectId?: string; // Foreign key reference to user_subjects
}

export interface NotesState {
  notes: Note[];
  searchTerm: string;
  sortType: string;
  currentPage: number;
  notesPerPage: number;
  loading: boolean;
  showArchived: boolean;
  filterOptions: FilterOptions;
  availableSubjects: string[]; // Available note subjects (academic subjects)
}
