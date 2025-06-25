
import { useReducer, useCallback, useMemo } from 'react';
import { Note } from '@/types/note';

// Operations state machine types
export type OperationState = 
  | 'idle'
  | 'creating'
  | 'updating'
  | 'deleting'
  | 'operation_success'
  | 'operation_error';

export interface OperationContext {
  activeOperations: Set<string>; // Track multiple operations by ID
  creatingNotes: Set<string>; // Track notes being created
  updatingNotes: Set<string>; // Track notes being updated
  deletingNotes: Set<string>; // Track notes being deleted
  lastOperationResult: Note | null;
  error: string | null;
  operationHistory: Array<{
    type: 'create' | 'update' | 'delete';
    noteId?: string;
    timestamp: number;
    success: boolean;
  }>;
}

type OperationEvent = 
  | { type: 'START_CREATE'; noteId?: string }
  | { type: 'START_UPDATE'; noteId: string }
  | { type: 'START_DELETE'; noteId: string }
  | { type: 'CREATE_SUCCESS'; note: Note }
  | { type: 'UPDATE_SUCCESS'; note: Note }
  | { type: 'DELETE_SUCCESS'; noteId: string }
  | { type: 'CREATE_ERROR'; error: string; noteId?: string }
  | { type: 'UPDATE_ERROR'; error: string; noteId: string }
  | { type: 'DELETE_ERROR'; error: string; noteId: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

interface OperationMachineState {
  state: OperationState;
  context: OperationContext;
}

const initialContext: OperationContext = {
  activeOperations: new Set(),
  creatingNotes: new Set(),
  updatingNotes: new Set(),
  deletingNotes: new Set(),
  lastOperationResult: null,
  error: null,
  operationHistory: [],
};

const initialState: OperationMachineState = {
  state: 'idle',
  context: initialContext,
};

function operationReducer(state: OperationMachineState, event: OperationEvent): OperationMachineState {
  const newActiveOperations = new Set(state.context.activeOperations);
  const newCreatingNotes = new Set(state.context.creatingNotes);
  const newUpdatingNotes = new Set(state.context.updatingNotes);
  const newDeletingNotes = new Set(state.context.deletingNotes);
  const newHistory = [...state.context.operationHistory];

  switch (event.type) {
    case 'START_CREATE':
      if (event.noteId) {
        newActiveOperations.add(`create-${event.noteId}`);
        newCreatingNotes.add(event.noteId);
      } else {
        newActiveOperations.add('create-new');
      }
      return {
        ...state,
        state: 'creating',
        context: {
          ...state.context,
          activeOperations: newActiveOperations,
          creatingNotes: newCreatingNotes,
          error: null,
        },
      };

    case 'START_UPDATE':
      newActiveOperations.add(`update-${event.noteId}`);
      newUpdatingNotes.add(event.noteId);
      return {
        ...state,
        state: 'updating',
        context: {
          ...state.context,
          activeOperations: newActiveOperations,
          updatingNotes: newUpdatingNotes,
          error: null,
        },
      };

    case 'START_DELETE':
      newActiveOperations.add(`delete-${event.noteId}`);
      newDeletingNotes.add(event.noteId);
      return {
        ...state,
        state: 'deleting',
        context: {
          ...state.context,
          activeOperations: newActiveOperations,
          deletingNotes: newDeletingNotes,
          error: null,
        },
      };

    case 'CREATE_SUCCESS':
      newActiveOperations.delete(`create-${event.note.id}`);
      newActiveOperations.delete('create-new');
      newCreatingNotes.delete(event.note.id);
      newHistory.push({
        type: 'create',
        noteId: event.note.id,
        timestamp: Date.now(),
        success: true,
      });
      return {
        ...state,
        state: newActiveOperations.size > 0 ? state.state : 'operation_success',
        context: {
          ...state.context,
          activeOperations: newActiveOperations,
          creatingNotes: newCreatingNotes,
          lastOperationResult: event.note,
          error: null,
          operationHistory: newHistory.slice(-50), // Keep last 50 operations
        },
      };

    case 'UPDATE_SUCCESS':
      newActiveOperations.delete(`update-${event.note.id}`);
      newUpdatingNotes.delete(event.note.id);
      newHistory.push({
        type: 'update',
        noteId: event.note.id,
        timestamp: Date.now(),
        success: true,
      });
      return {
        ...state,
        state: newActiveOperations.size > 0 ? state.state : 'operation_success',
        context: {
          ...state.context,
          activeOperations: newActiveOperations,
          updatingNotes: newUpdatingNotes,
          lastOperationResult: event.note,
          error: null,
          operationHistory: newHistory.slice(-50),
        },
      };

    case 'DELETE_SUCCESS':
      newActiveOperations.delete(`delete-${event.noteId}`);
      newDeletingNotes.delete(event.noteId);
      newHistory.push({
        type: 'delete',
        noteId: event.noteId,
        timestamp: Date.now(),
        success: true,
      });
      return {
        ...state,
        state: newActiveOperations.size > 0 ? state.state : 'operation_success',
        context: {
          ...state.context,
          activeOperations: newActiveOperations,
          deletingNotes: newDeletingNotes,
          lastOperationResult: null,
          error: null,
          operationHistory: newHistory.slice(-50),
        },
      };

    case 'CREATE_ERROR':
      if (event.noteId) {
        newActiveOperations.delete(`create-${event.noteId}`);
        newCreatingNotes.delete(event.noteId);
      } else {
        newActiveOperations.delete('create-new');
      }
      newHistory.push({
        type: 'create',
        noteId: event.noteId,
        timestamp: Date.now(),
        success: false,
      });
      return {
        ...state,
        state: 'operation_error',
        context: {
          ...state.context,
          activeOperations: newActiveOperations,
          creatingNotes: newCreatingNotes,
          error: event.error,
          operationHistory: newHistory.slice(-50),
        },
      };

    case 'UPDATE_ERROR':
      newActiveOperations.delete(`update-${event.noteId}`);
      newUpdatingNotes.delete(event.noteId);
      newHistory.push({
        type: 'update',
        noteId: event.noteId,
        timestamp: Date.now(),
        success: false,
      });
      return {
        ...state,
        state: 'operation_error',
        context: {
          ...state.context,
          activeOperations: newActiveOperations,
          updatingNotes: newUpdatingNotes,
          error: event.error,
          operationHistory: newHistory.slice(-50),
        },
      };

    case 'DELETE_ERROR':
      newActiveOperations.delete(`delete-${event.noteId}`);
      newDeletingNotes.delete(event.noteId);
      newHistory.push({
        type: 'delete',
        noteId: event.noteId,
        timestamp: Date.now(),
        success: false,
      });
      return {
        ...state,
        state: 'operation_error',
        context: {
          ...state.context,
          activeOperations: newActiveOperations,
          deletingNotes: newDeletingNotes,
          error: event.error,
          operationHistory: newHistory.slice(-50),
        },
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        state: state.context.activeOperations.size > 0 ? state.state : 'idle',
        context: {
          ...state.context,
          error: null,
        },
      };

    case 'RESET_STATE':
      return {
        state: 'idle',
        context: {
          ...initialContext,
          activeOperations: new Set(),
          creatingNotes: new Set(),
          updatingNotes: new Set(),
          deletingNotes: new Set(),
          operationHistory: [],
        },
      };

    default:
      return state;
  }
}

/**
 * Operations state machine hook for managing all CRUD operations
 */
export const useNotesOperationsStateMachine = () => {
  const [machineState, dispatch] = useReducer(operationReducer, initialState);

  // Action creators
  const actions = useMemo(() => ({
    startCreate: (noteId?: string) => {
      dispatch({ type: 'START_CREATE', noteId });
    },

    startUpdate: (noteId: string) => {
      dispatch({ type: 'START_UPDATE', noteId });
    },

    startDelete: (noteId: string) => {
      dispatch({ type: 'START_DELETE', noteId });
    },

    createSuccess: (note: Note) => {
      dispatch({ type: 'CREATE_SUCCESS', note });
    },

    updateSuccess: (note: Note) => {
      dispatch({ type: 'UPDATE_SUCCESS', note });
    },

    deleteSuccess: (noteId: string) => {
      dispatch({ type: 'DELETE_SUCCESS', noteId });
    },

    createError: (error: string, noteId?: string) => {
      dispatch({ type: 'CREATE_ERROR', error, noteId });
    },

    updateError: (error: string, noteId: string) => {
      dispatch({ type: 'UPDATE_ERROR', error, noteId });
    },

    deleteError: (error: string, noteId: string) => {
      dispatch({ type: 'DELETE_ERROR', error, noteId });
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },

    resetState: () => {
      dispatch({ type: 'RESET_STATE' });
    },
  }), []);

  // Selectors
  const selectors = useMemo(() => ({
    // State selectors
    isIdle: machineState.state === 'idle',
    isCreating: machineState.state === 'creating',
    isUpdating: machineState.state === 'updating',
    isDeleting: machineState.state === 'deleting',
    isOperationSuccess: machineState.state === 'operation_success',
    isOperationError: machineState.state === 'operation_error',
    
    // Operation state selectors
    isAnyOperationInProgress: machineState.context.activeOperations.size > 0,
    hasError: !!machineState.context.error,
    
    // Granular operation checks
    isCreatingNote: (noteId?: string) => {
      return noteId ? machineState.context.creatingNotes.has(noteId) : machineState.context.creatingNotes.size > 0;
    },
    
    isUpdatingNote: (noteId: string) => {
      return machineState.context.updatingNotes.has(noteId);
    },
    
    isDeletingNote: (noteId: string) => {
      return machineState.context.deletingNotes.has(noteId);
    },
    
    // Operation counts
    activeOperationCount: machineState.context.activeOperations.size,
    creatingCount: machineState.context.creatingNotes.size,
    updatingCount: machineState.context.updatingNotes.size,
    deletingCount: machineState.context.deletingNotes.size,
    
    // Recent operations
    recentOperations: machineState.context.operationHistory.slice(-10),
    successfulOperationsCount: machineState.context.operationHistory.filter(op => op.success).length,
    failedOperationsCount: machineState.context.operationHistory.filter(op => !op.success).length,
  }), [machineState]);

  return {
    // State
    state: machineState.state,
    
    // Context
    activeOperations: machineState.context.activeOperations,
    creatingNotes: machineState.context.creatingNotes,
    updatingNotes: machineState.context.updatingNotes,
    deletingNotes: machineState.context.deletingNotes,
    lastOperationResult: machineState.context.lastOperationResult,
    error: machineState.context.error,
    operationHistory: machineState.context.operationHistory,
    
    // Actions
    actions,
    
    // Selectors
    ...selectors,
    
    // Debug info
    debug: {
      state: machineState.state,
      context: machineState.context,
      activeOperationsArray: Array.from(machineState.context.activeOperations),
      creatingNotesArray: Array.from(machineState.context.creatingNotes),
      updatingNotesArray: Array.from(machineState.context.updatingNotes),
      deletingNotesArray: Array.from(machineState.context.deletingNotes),
    },
  };
};

export default useNotesOperationsStateMachine;
