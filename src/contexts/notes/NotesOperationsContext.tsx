
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useOptimizedNotesWithQuery } from '@/hooks/useOptimizedNotesWithQuery';

interface NotesOperationsContextType {
  // CRUD operations
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  pinNote: (id: string, pinned: boolean) => Promise<void>;
  archiveNote: (id: string, archived: boolean) => Promise<void>;
  
  // Operation states for UI feedback
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPinning: boolean;
}

const NotesOperationsContext = createContext<NotesOperationsContextType | undefined>(undefined);

const NotesOperationsProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const queryHook = useOptimizedNotesWithQuery();

  // Memoized context value focused only on operations
  const contextValue = useMemo(() => ({
    // CRUD operations
    addNote: queryHook.addNote,
    updateNote: queryHook.updateNote,
    deleteNote: queryHook.deleteNote,
    pinNote: queryHook.pinNote,
    archiveNote: async (id: string, archived: boolean) => {
      await queryHook.updateNote(id, { archived });
    },
    
    // Operation states
    isCreating: queryHook.isCreating,
    isUpdating: queryHook.isUpdating,
    isDeleting: queryHook.isDeleting,
    isPinning: queryHook.isPinning,
  }), [
    queryHook.addNote,
    queryHook.updateNote,
    queryHook.deleteNote,
    queryHook.pinNote,
    queryHook.isCreating,
    queryHook.isUpdating,
    queryHook.isDeleting,
    queryHook.isPinning,
  ]);

  return (
    <NotesOperationsContext.Provider value={contextValue}>
      {children}
    </NotesOperationsContext.Provider>
  );
});

NotesOperationsProviderInner.displayName = 'NotesOperationsProviderInner';

export const NotesOperationsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NotesOperationsProviderInner>
      {children}
    </NotesOperationsProviderInner>
  );
};

export const useNotesOperations = () => {
  const context = useContext(NotesOperationsContext);
  if (context === undefined) {
    throw new Error('useNotesOperations must be used within a NotesOperationsProvider');
  }
  return context;
};
