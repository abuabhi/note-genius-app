
import { Note } from "@/types/note";

export interface FilterOptions {
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  sourceType?: string | string[];
  tags?: string[];
}

export interface NoteContextType {
  notes: Note[];
  filteredNotes: Note[];
  paginatedNotes: Note[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  pinNote: (id: string, pinned: boolean) => Promise<void>;
  archiveNote: (id: string, archived: boolean) => Promise<void>;
  sortType: string;
  setSortType: (type: string) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  notesPerPage: number;
  setNotesPerPage: (count: number) => void;
  loading: boolean;
  getAllTags: () => Promise<{ id: string; name: string; color: string }[]>;
  filterByTag: (tagName: string) => void;
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
  resetFilters: () => void;
  availableCategories: string[];
  addCategory: (category: string) => void;
}
