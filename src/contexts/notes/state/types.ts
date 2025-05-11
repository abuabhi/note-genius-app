
import { Note } from "@/types/note";

// Types moved from the main types.ts
export type SortType = 'newest' | 'oldest' | 'alphabetical' | 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'category';

export interface FilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
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
  availableCategories: string[];
}
