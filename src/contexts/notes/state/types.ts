
import { Note } from "@/types/note";

// Types moved from the main types.ts
export type SortType = 'newest' | 'oldest' | 'alphabetical' | 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'subject';

export interface FilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  subject?: string;
  sourceType?: 'manual' | 'scan' | 'import' | ('manual' | 'scan' | 'import')[];
  hasTags?: boolean;
  tags?: string[];
  subjectId?: string;
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
  availableSubjects: string[];
}
