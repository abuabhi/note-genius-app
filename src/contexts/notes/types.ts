
import { Note } from "@/types/note";
import { FilterOptions, SortType } from "./state/types";

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
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  availableSubjects: string[];
  addSubject: (subject: string) => void;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>; 
  tags: { id: string; name: string; color: string }[]; // Added tags property
}

// Re-export types from state/types for backward compatibility
export type { FilterOptions, SortType };
