import React, { createContext, useContext, ReactNode } from 'react';
import { useNotesForm } from '@/hooks/useNotesForm';

// Type definition that matches the consolidated hook return type
type NotesContextType = ReturnType<typeof useNotesForm>;

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const notesForm = useNotesForm();

  return (
    <NotesContext.Provider value={notesForm}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};