
import { Note } from "@/types/note";

export type SortType = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'category';

export interface FilterOptions {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  sourceType?: ('manual' | 'scan' | 'import')[];
  hasTags?: boolean;
  [key: string]: any;
}

export interface NoteContextType {
  notes: Note[];
  filteredNotes: Note[];
  paginatedNotes: Note[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (id: string, updatedNote: Partial<Note>) => Promise<void>;
  pinNote: (id: string, pinned: boolean) => Promise<void>;
  archiveNote: (id: string, archived: boolean) => Promise<void>;
  sortType: SortType;
  setSortType: (sortType: SortType) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  notesPerPage: number;
  setNotesPerPage: (perPage: number) => void;
  loading: boolean;
  getAllTags: () => Promise<{ id: string; name: string; color: string; }[]>;
  filterByTag: (tagName: string) => void;
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions | ((prev: FilterOptions) => FilterOptions)) => void;
  resetFilters: () => void;
  availableCategories: string[];
}
