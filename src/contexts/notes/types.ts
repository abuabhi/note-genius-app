
import { Note } from "@/types/note";

export type SortType = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'category';

export interface NoteContextType {
  notes: Note[];
  filteredNotes: Note[];
  paginatedNotes: Note[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (id: string, updatedNote: Partial<Note>) => Promise<void>;
  sortType: SortType;
  setSortType: (type: SortType) => void;
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  notesPerPage: number;
  setNotesPerPage: (count: number) => void;
  loading: boolean;
  // Language detection for scanned notes
  detectedLanguage?: string;
  setDetectedLanguage?: (language: string) => void;
  // Tag-related functions
  getAllTags: () => Promise<{ id: string; name: string; color: string }[]>;
  filterByTag: (tagName: string) => void;
}
