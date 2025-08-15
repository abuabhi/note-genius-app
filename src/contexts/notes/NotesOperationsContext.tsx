
// @ts-nocheck

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Note } from '@/types/note';
import { useNotesOperationsStateMachine } from '@/hooks/notes/useNotesOperationsStateMachine';
import { useOptimizedNotesWithQuery } from '@/hooks/useOptimizedNotesWithQuery';

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
  
  // Granular operation states with state machine
  isCreatingNote: (noteId?: string) => boolean;
  isUpdatingNote: (noteId: string) => boolean;
  isDeletingNote: (noteId: string) => boolean;
  
  // General operation state with enhanced tracking
  isAnyOperationInProgress: boolean;
  activeOperationCount: number;
  
  // Error handling from state machine
  hasOperationError: boolean;
  operationError: string | null;
  clearOperationError: () => void;
  
  // Operation history and stats
  recentOperations: Array<{
    type: 'create' | 'update' | 'delete';
    noteId?: string;
    timestamp: number;
    success: boolean;
  }>;
  successfulOperationsCount: number;
  failedOperationsCount: number;
}

const NotesOperationsContext = createContext<NotesOperationsContextType | undefined>(undefined);

const NotesOperationsProviderInner = React.memo(({ children }: { children: ReactNode }) => {
  const operationsStateMachine = useNotesOperationsStateMachine();
  const queryHook = useOptimizedNotesWithQuery();

  // Enhanced CRUD operations with state machine integration
  const operations = useMemo(() => ({
    addNote: async (noteData: Omit<Note, 'id'>) => {
      operationsStateMachine.actions.startCreate();
      try {
        const result = await queryHook.addNote(noteData);
        if (result) {
          operationsStateMachine.actions.createSuccess(result);
          return result;
        } else {
          operationsStateMachine.actions.createError('Failed to create note');
          return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
        operationsStateMachine.actions.createError(errorMessage);
        return null;
      }
    },

    updateNote: async (id: string, updates: Partial<Note>) => {
      operationsStateMachine.actions.startUpdate(id);
      try {
        await queryHook.updateNote(id, updates);
        // Create a mock updated note for success tracking
        const updatedNote = { id, ...updates } as Note;
        operationsStateMachine.actions.updateSuccess(updatedNote);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
        operationsStateMachine.actions.updateError(errorMessage, id);
        throw error;
      }
    },

    deleteNote: async (id: string) => {
      operationsStateMachine.actions.startDelete(id);
      try {
        await queryHook.deleteNote(id);
        operationsStateMachine.actions.deleteSuccess(id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
        operationsStateMachine.actions.deleteError(errorMessage, id);
        throw error;
      }
    },

    pinNote: async (id: string, pinned: boolean) => {
      operationsStateMachine.actions.startUpdate(id);
      try {
        await queryHook.pinNote(id, pinned);
        const updatedNote = { id, pinned } as Note;
        operationsStateMachine.actions.updateSuccess(updatedNote);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to pin note';
        operationsStateMachine.actions.updateError(errorMessage, id);
        throw error;
      }
    },

    archiveNote: async (id: string, archived: boolean) => {
      operationsStateMachine.actions.startUpdate(id);
      try {
        await queryHook.updateNote(id, { archived });
        const updatedNote = { id, archived } as Note;
        operationsStateMachine.actions.updateSuccess(updatedNote);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to archive note';
        operationsStateMachine.actions.updateError(errorMessage, id);
        throw error;
      }
    },
  }), [operationsStateMachine.actions, queryHook]);

  // Memoized context value with enhanced state machine integration
  const contextValue = useMemo(() => ({
    // CRUD operations with state machine integration
    ...operations,
    
    // Enhanced operation states from state machine
    isCreating: operationsStateMachine.isCreating,
    isUpdating: operationsStateMachine.isUpdating,
    isDeleting: operationsStateMachine.isDeleting,
    isPinning: operationsStateMachine.isUpdating, // Pinning is an update operation
    
    // Granular operation states with state machine
    isCreatingNote: operationsStateMachine.isCreatingNote,
    isUpdatingNote: operationsStateMachine.isUpdatingNote,
    isDeletingNote: operationsStateMachine.isDeletingNote,
    
    // General operation state with enhanced tracking
    isAnyOperationInProgress: operationsStateMachine.isAnyOperationInProgress,
    activeOperationCount: operationsStateMachine.activeOperationCount,
    
    // Error handling from state machine
    hasOperationError: operationsStateMachine.hasError,
    operationError: operationsStateMachine.error,
    clearOperationError: operationsStateMachine.actions.clearError,
    
    // Operation history and stats
    recentOperations: operationsStateMachine.recentOperations,
    successfulOperationsCount: operationsStateMachine.successfulOperationsCount,
    failedOperationsCount: operationsStateMachine.failedOperationsCount,
  }), [
    operations,
    operationsStateMachine.isCreating,
    operationsStateMachine.isUpdating,
    operationsStateMachine.isDeleting,
    operationsStateMachine.isCreatingNote,
    operationsStateMachine.isUpdatingNote,
    operationsStateMachine.isDeletingNote,
    operationsStateMachine.isAnyOperationInProgress,
    operationsStateMachine.activeOperationCount,
    operationsStateMachine.hasError,
    operationsStateMachine.error,
    operationsStateMachine.actions.clearError,
    operationsStateMachine.recentOperations,
    operationsStateMachine.successfulOperationsCount,
    operationsStateMachine.failedOperationsCount,
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
