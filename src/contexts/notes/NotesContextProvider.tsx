
import React, { ReactNode } from 'react';
import { NotesDataProvider } from './NotesDataContext';
import { NotesUIProvider } from './NotesUIContext';
import { NotesOperationsProvider } from './NotesOperationsContext';

interface NotesContextProviderProps {
  children: ReactNode;
}

export const NotesContextProvider = ({ children }: NotesContextProviderProps) => {
  return (
    <NotesDataProvider>
      <NotesUIProvider>
        <NotesOperationsProvider>
          {children}
        </NotesOperationsProvider>
      </NotesUIProvider>
    </NotesDataProvider>
  );
};
