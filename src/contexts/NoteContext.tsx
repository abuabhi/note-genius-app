
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

interface NoteContextType {
  notes: Note[];
  filteredNotes: Note[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const addNote = (note: Note) => {
    setNotes(prevNotes => [note, ...prevNotes]);
  };

  const deleteNote = (id: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
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
      filteredNotes, 
      searchTerm, 
      setSearchTerm, 
      addNote, 
      deleteNote, 
      updateNote 
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
