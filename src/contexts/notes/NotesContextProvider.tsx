
import React, { ReactNode } from 'react';
import { NotesDataProvider } from './NotesDataContext';
import { NotesUIProvider, useNotesUI } from './NotesUIContext';
import { NotesOperationsProvider } from './NotesOperationsContext';

interface NotesContextProviderProps {
  children: ReactNode;
}

export const NotesContextProvider = ({ children }: NotesContextProviderProps) => {
  return (
    <NotesUIProvider>
      <NotesDataProviderWithFilters>
        <NotesOperationsProvider>
          {children}
        </NotesOperationsProvider>
      </NotesDataProviderWithFilters>
    </NotesUIProvider>
  );
};

// Wrapper that connects filter state to data provider
const NotesDataProviderWithFilters = ({ children }: { children: ReactNode }) => {
  const { searchTerm, selectedSubject, showArchived, sortType } = useNotesUI();
  
  const filterState = {
    searchTerm,
    selectedSubject,
    showArchived,
    sortType
  };
  
  return (
    <NotesDataProvider filterState={filterState}>
      {children}
    </NotesDataProvider>
  );
};
