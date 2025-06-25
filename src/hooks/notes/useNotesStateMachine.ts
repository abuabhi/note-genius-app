
import { useState, useCallback, useReducer, useMemo } from 'react';
import { Note } from '@/types/note';

// Define all possible states for the notes system
export type NotesState = 
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'error'
  | 'refreshing'
  | 'filtering'
  | 'paginating'
  | 'creating'
  | 'updating'
  | 'deleting';

// Define all possible actions that can trigger state transitions
export type NotesAction = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { notes: Note[]; totalCount: number; hasMore: boolean } }
  | { type: 'FETCH_ERROR'; payload: { error: string } }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: { notes: Note[]; totalCount: number; hasMore: boolean } }
  | { type: 'FILTER_START' }
  | { type: 'FILTER_SUCCESS'; payload: { notes: Note[]; totalCount: number; hasMore: boolean } }
  | { type: 'PAGINATE_START' }
  | { type: 'PAGINATE_SUCCESS'; payload: { notes: Note[]; totalCount: number; hasMore: boolean } }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; payload: { note: Note } }
  | { type: 'CREATE_ERROR'; payload: { error: string } }
  | { type: 'UPDATE_START'; payload: { noteId: string } }
  | { type: 'UPDATE_SUCCESS'; payload: { note: Note } }
  | { type: 'UPDATE_ERROR'; payload: { error: string; noteId: string } }
  | { type: 'DELETE_START'; payload: { noteId: string } }
  | { type: 'DELETE_SUCCESS'; payload: { noteId: string } }
  | { type: 'DELETE_ERROR'; payload: { error: string; noteId: string } }
  | { type: 'RESET' }
  | { type: 'CLEAR_ERROR' };

// State machine context that holds all the data
export interface NotesStateMachineContext {
  state: NotesState;
  notes: Note[];
  totalCount: number;
  hasMore: boolean;
  error: string | null;
  loading: boolean;
  operationInProgress: {
    creating: boolean;
    updating: string | null; // noteId being updated
    deleting: string | null; // noteId being deleted
  };
  lastAction: NotesAction | null;
  retryCount: number;
}

// Initial state for the state machine
const initialContext: NotesStateMachineContext = {
  state: 'idle',
  notes: [],
  totalCount: 0,
  hasMore: false,
  error: null,
  loading: false,
  operationInProgress: {
    creating: false,
    updating: null,
    deleting: null,
  },
  lastAction: null,
  retryCount: 0,
};

// State machine reducer that handles all state transitions
function notesStateMachineReducer(
  context: NotesStateMachineContext, 
  action: NotesAction
): NotesStateMachineContext {
  console.log('🔄 Notes State Machine:', context.state, '->', action.type);

  switch (action.type) {
    case 'FETCH_START':
      return {
        ...context,
        state: context.notes.length === 0 ? 'loading' : 'refreshing',
        loading: true,
        error: null,
        lastAction: action,
      };

    case 'FETCH_SUCCESS':
      return {
        ...context,
        state: 'loaded',
        notes: action.payload.notes,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        loading: false,
        error: null,
        retryCount: 0,
        lastAction: action,
      };

    case 'FETCH_ERROR':
      return {
        ...context,
        state: 'error',
        loading: false,
        error: action.payload.error,
        retryCount: context.retryCount + 1,
        lastAction: action,
      };

    case 'REFRESH_START':
      return {
        ...context,
        state: 'refreshing',
        loading: true,
        error: null,
        lastAction: action,
      };

    case 'REFRESH_SUCCESS':
      return {
        ...context,
        state: 'loaded',
        notes: action.payload.notes,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        loading: false,
        error: null,
        retryCount: 0,
        lastAction: action,
      };

    case 'FILTER_START':
      return {
        ...context,
        state: 'filtering',
        loading: true,
        error: null,
        lastAction: action,
      };

    case 'FILTER_SUCCESS':
      return {
        ...context,
        state: 'loaded',
        notes: action.payload.notes,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        loading: false,
        error: null,
        lastAction: action,
      };

    case 'PAGINATE_START':
      return {
        ...context,
        state: 'paginating',
        loading: true,
        error: null,
        lastAction: action,
      };

    case 'PAGINATE_SUCCESS':
      return {
        ...context,
        state: 'loaded',
        notes: action.payload.notes,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        loading: false,
        error: null,
        lastAction: action,
      };

    case 'CREATE_START':
      return {
        ...context,
        state: 'creating',
        operationInProgress: {
          ...context.operationInProgress,
          creating: true,
        },
        error: null,
        lastAction: action,
      };

    case 'CREATE_SUCCESS':
      return {
        ...context,
        state: 'loaded',
        notes: [action.payload.note, ...context.notes],
        totalCount: context.totalCount + 1,
        operationInProgress: {
          ...context.operationInProgress,
          creating: false,
        },
        error: null,
        lastAction: action,
      };

    case 'CREATE_ERROR':
      return {
        ...context,
        state: 'error',
        operationInProgress: {
          ...context.operationInProgress,
          creating: false,
        },
        error: action.payload.error,
        lastAction: action,
      };

    case 'UPDATE_START':
      return {
        ...context,
        state: 'updating',
        operationInProgress: {
          ...context.operationInProgress,
          updating: action.payload.noteId,
        },
        error: null,
        lastAction: action,
      };

    case 'UPDATE_SUCCESS':
      return {
        ...context,
        state: 'loaded',
        notes: context.notes.map(note => 
          note.id === action.payload.note.id ? action.payload.note : note
        ),
        operationInProgress: {
          ...context.operationInProgress,
          updating: null,
        },
        error: null,
        lastAction: action,
      };

    case 'UPDATE_ERROR':
      return {
        ...context,
        state: 'error',
        operationInProgress: {
          ...context.operationInProgress,
          updating: null,
        },
        error: action.payload.error,
        lastAction: action,
      };

    case 'DELETE_START':
      return {
        ...context,
        state: 'deleting',
        operationInProgress: {
          ...context.operationInProgress,
          deleting: action.payload.noteId,
        },
        error: null,
        lastAction: action,
      };

    case 'DELETE_SUCCESS':
      return {
        ...context,
        state: 'loaded',
        notes: context.notes.filter(note => note.id !== action.payload.noteId),
        totalCount: Math.max(0, context.totalCount - 1),
        operationInProgress: {
          ...context.operationInProgress,
          deleting: null,
        },
        error: null,
        lastAction: action,
      };

    case 'DELETE_ERROR':
      return {
        ...context,
        state: 'error',
        operationInProgress: {
          ...context.operationInProgress,
          deleting: null,
        },
        error: action.payload.error,
        lastAction: action,
      };

    case 'CLEAR_ERROR':
      return {
        ...context,
        error: null,
        state: context.notes.length > 0 ? 'loaded' : 'idle',
        lastAction: action,
      };

    case 'RESET':
      return {
        ...initialContext,
        lastAction: action,
      };

    default:
      return context;
  }
}

// Hook that provides the state machine functionality
export const useNotesStateMachine = () => {
  const [context, dispatch] = useReducer(notesStateMachineReducer, initialContext);

  // Memoized selectors for different aspects of the state
  const selectors = useMemo(() => ({
    // Basic state selectors
    isIdle: context.state === 'idle',
    isLoading: context.state === 'loading',
    isLoaded: context.state === 'loaded',
    isError: context.state === 'error',
    isRefreshing: context.state === 'refreshing',
    isFiltering: context.state === 'filtering',
    isPaginating: context.state === 'paginating',
    
    // Operation state selectors
    isCreating: context.state === 'creating',
    isUpdating: context.state === 'updating',
    isDeleting: context.state === 'deleting',
    
    // Specific operation selectors
    isCreatingNote: context.operationInProgress.creating,
    isUpdatingNote: (noteId: string) => context.operationInProgress.updating === noteId,
    isDeletingNote: (noteId: string) => context.operationInProgress.deleting === noteId,
    
    // Data selectors
    hasNotes: context.notes.length > 0,
    hasError: !!context.error,
    canRetry: context.state === 'error' && context.retryCount < 3,
    isEmpty: context.notes.length === 0 && context.state === 'loaded',
    
    // Loading state variations
    isInitialLoading: context.state === 'loading' && context.notes.length === 0,
    isBackgroundLoading: ['refreshing', 'filtering', 'paginating'].includes(context.state),
    isAnyOperationInProgress: ['creating', 'updating', 'deleting'].includes(context.state),
    
  }), [context]);

  // Action creators for common operations
  const actions = useMemo(() => ({
    startFetch: () => dispatch({ type: 'FETCH_START' }),
    fetchSuccess: (notes: Note[], totalCount: number, hasMore: boolean) => 
      dispatch({ type: 'FETCH_SUCCESS', payload: { notes, totalCount, hasMore } }),
    fetchError: (error: string) => 
      dispatch({ type: 'FETCH_ERROR', payload: { error } }),
    
    startRefresh: () => dispatch({ type: 'REFRESH_START' }),
    refreshSuccess: (notes: Note[], totalCount: number, hasMore: boolean) => 
      dispatch({ type: 'REFRESH_SUCCESS', payload: { notes, totalCount, hasMore } }),
    
    startFilter: () => dispatch({ type: 'FILTER_START' }),
    filterSuccess: (notes: Note[], totalCount: number, hasMore: boolean) => 
      dispatch({ type: 'FILTER_SUCCESS', payload: { notes, totalCount, hasMore } }),
    
    startPaginate: () => dispatch({ type: 'PAGINATE_START' }),
    paginateSuccess: (notes: Note[], totalCount: number, hasMore: boolean) => 
      dispatch({ type: 'PAGINATE_SUCCESS', payload: { notes, totalCount, hasMore } }),
    
    startCreate: () => dispatch({ type: 'CREATE_START' }),
    createSuccess: (note: Note) => 
      dispatch({ type: 'CREATE_SUCCESS', payload: { note } }),
    createError: (error: string) => 
      dispatch({ type: 'CREATE_ERROR', payload: { error } }),
    
    startUpdate: (noteId: string) => 
      dispatch({ type: 'UPDATE_START', payload: { noteId } }),
    updateSuccess: (note: Note) => 
      dispatch({ type: 'UPDATE_SUCCESS', payload: { note } }),
    updateError: (error: string, noteId: string) => 
      dispatch({ type: 'UPDATE_ERROR', payload: { error, noteId } }),
    
    startDelete: (noteId: string) => 
      dispatch({ type: 'DELETE_START', payload: { noteId } }),
    deleteSuccess: (noteId: string) => 
      dispatch({ type: 'DELETE_SUCCESS', payload: { noteId } }),
    deleteError: (error: string, noteId: string) => 
      dispatch({ type: 'DELETE_ERROR', payload: { error, noteId } }),
    
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    reset: () => dispatch({ type: 'RESET' }),
  }), []);

  // Retry functionality with exponential backoff
  const retry = useCallback(() => {
    if (context.lastAction && context.retryCount < 3) {
      const delay = Math.min(1000 * Math.pow(2, context.retryCount), 5000);
      setTimeout(() => {
        // Re-dispatch the last action to retry
        if (context.lastAction?.type === 'FETCH_ERROR') {
          dispatch({ type: 'FETCH_START' });
        }
      }, delay);
    }
  }, [context.lastAction, context.retryCount]);

  return {
    // Current state and data
    state: context.state,
    notes: context.notes,
    totalCount: context.totalCount,
    hasMore: context.hasMore,
    error: context.error,
    loading: context.loading,
    operationInProgress: context.operationInProgress,
    retryCount: context.retryCount,
    
    // State selectors
    ...selectors,
    
    // Action dispatchers
    actions,
    
    // Utility functions
    retry,
    
    // Debug information
    debug: {
      lastAction: context.lastAction,
      stateHistory: context.state,
    },
  };
};

export default useNotesStateMachine;
