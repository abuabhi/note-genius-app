
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useNotesWithStateMachine } from '@/hooks/notes/useNotesWithStateMachine';

interface NotesOperationsContextType {
  // CRUD operations with state machine integration
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  pinNote: (id: string, pinned: boolean) => Promise<void>;
  archiveNote: (id: string, archived: boolean) => Promise<void>;
  
  // Enhanced operation states from state machine
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPinning: boolean;
  
  // Granular operation states
  isUpdatingNote: (noteId: string) => boolean;
  isDeletingNote: (noteId: string) => boolean;
  
  // General operation state
  isAnyOperationInProgress: boolean;
}

const NotesOperationsContext = createContext<NotesOperationsContextType | undefined>(undefined);

const NotesOperationsProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const stateMachineHook = useNotesWithStateMachine();

  // Memoized context value focused only on operations with state machine enhancements
  const contextValue = useMemo(() => ({
    // CRUD operations with state machine integration
    addNote: stateMachineHook.addNote,
    updateNote: stateMachineHook.updateNote,
    deleteNote: stateMachineHook.deleteNote,
    pinNote: stateMachineHook.pinNote,
    archiveNote: async (id: string, archived: boolean) => {
      await stateMachineHook.updateNote(id, { archived });
    },
    
    // Enhanced operation states from state machine
    isCreating: stateMachineHook.isCreating,
    isUpdating: stateMachineHook.isUpdating,
    isDeleting: stateMachineHook.isDeleting,
    isPinning: stateMachineHook.isUpdating, // Pinning is an update operation
    
    // Granular operation states
    isUpdatingNote: stateMachineHook.isUpdatingNote,
    isDeletingNote: stateMachineHook.isDeletingNote,
    
    // General operation state
    isAnyOperationInProgress: stateMachineHook.isCreating || stateMachineHook.isUpdating || stateMachineHook.isDeleting,
  }), [
    stateMachineHook.addNote,
    stateMachineHook.updateNote,
    stateMachineHook.deleteNote,
    stateMachineHook.pinNote,
    stateMachineHook.isCreating,
    stateMachineHook.isUpdating,
    stateMachineHook.isDeleting,
    stateMachineHook.isUpdatingNote,
    stateMachineHook.isDeletingNote,
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
