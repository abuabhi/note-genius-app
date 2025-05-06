
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';

// Mock data for initial notes
const initialNotes: Note[] = [
  {
    id: "1",
    title: "React Hooks",
    description: "Understanding useState and useEffect",
    date: "2025-04-25",
    category: "Programming",
  },
  {
    id: "2",
    title: "Data Structures",
    description: "Arrays, Linked Lists, and Trees",
    date: "2025-04-24",
    category: "Computer Science",
  },
  {
    id: "3",
    title: "TypeScript Basics",
    description: "Types, Interfaces, and Generics",
    date: "2025-04-23",
    category: "Programming",
  },
];

type SortType = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc' | 'category';

interface NoteContextType {
  notes: Note[];
  filteredNotes: Note[];
  paginatedNotes: Note[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
  sortType: SortType;
  setSortType: (type: SortType) => void;
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  notesPerPage: number;
  setNotesPerPage: (count: number) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [notesPerPage, setNotesPerPage] = useState<number>(6);

  // Filter notes based on search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerSearchTerm) || 
      note.description.toLowerCase().includes(lowerSearchTerm) || 
      note.category.toLowerCase().includes(lowerSearchTerm) ||
      (note.content && note.content.toLowerCase().includes(lowerSearchTerm))
    );
  }, [notes, searchTerm]);

  // Sort the filtered notes
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      switch (sortType) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }, [filteredNotes, sortType]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedNotes.length / notesPerPage);

  // Get current notes for the page
  const paginatedNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * notesPerPage;
    return sortedNotes.slice(startIndex, startIndex + notesPerPage);
  }, [sortedNotes, currentPage, notesPerPage]);

  const addNote = (note: Note) => {
    setNotes(prevNotes => [note, ...prevNotes]);
  };

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    // Reset to first page if we delete the last note of the page
    if (paginatedNotes.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const updateNote = (id: string, updatedNote: Partial<Note>) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, ...updatedNote } : note
      )
    );
  };

  return (
    <NoteContext.Provider value={{ 
      notes, 
      filteredNotes: sortedNotes, 
      paginatedNotes,
      searchTerm, 
      setSearchTerm, 
      addNote, 
      deleteNote, 
      updateNote,
      sortType,
      setSortType,
      currentPage,
      setCurrentPage,
      totalPages,
      notesPerPage,
      setNotesPerPage
    }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};
