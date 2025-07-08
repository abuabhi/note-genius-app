
import { useReducer, useCallback, useMemo } from 'react';
import { Note } from '@/types/note';

// Simplified data state machine - just track basic states
export type DataState = 
  | 'loading'
  | 'success'
  | 'error';

export interface DataContext {
  notes: Note[];
  totalCount: number;
  currentPage: number;
  hasMore: boolean;
  error: string | null;
  retryCount: number;
  lastFetchTime: number | null;
  paginationMode: 'regular' | 'infinite';
}

type DataEvent = 
  | { type: 'START_LOADING' }
  | { type: 'FETCH_SUCCESS'; notes: Note[]; totalCount: number; hasMore: boolean }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_PAGINATION_MODE'; mode: 'regular' | 'infinite' };

interface DataMachineState {
  state: DataState;
  context: DataContext;
}

const initialContext: DataContext = {
  notes: [],
  totalCount: 0,
  currentPage: 1,
  hasMore: false,
  error: null,
  retryCount: 0,
  lastFetchTime: null,
  paginationMode: 'infinite',
};

// Simple initial state - no session storage complexity
const initialState: DataMachineState = {
  state: 'loading',
  context: initialContext,
};

// Simplified reducer - no complex state transitions
function dataReducer(state: DataMachineState, event: DataEvent): DataMachineState {
  switch (event.type) {
    case 'START_LOADING':
      return {
        ...state,
        state: 'loading',
        context: {
          ...state.context,
          error: null,
        },
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        state: 'success',
        context: {
          ...state.context,
          notes: event.notes,
          totalCount: event.totalCount,
          hasMore: event.hasMore,
          error: null,
          lastFetchTime: Date.now(),
        },
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        state: 'error',
        context: {
          ...state.context,
          error: event.error,
        },
      };

    case 'SET_PAGE':
      return {
        ...state,
        context: {
          ...state.context,
          currentPage: event.page,
        },
      };

    case 'SET_PAGINATION_MODE':
      return {
        ...state,
        context: {
          ...state.context,
          paginationMode: event.mode,
          currentPage: 1,
        },
      };

    default:
      return state;
  }
}

/**
 * Data state machine hook for managing all data-related operations
 */
export const useNotesDataStateMachine = () => {
  const [machineState, dispatch] = useReducer(dataReducer, initialState);

  // Simplified action creators
  const actions = useMemo(() => ({
    startLoading: () => {
      dispatch({ type: 'START_LOADING' });
    },

    fetchSuccess: (notes: Note[], totalCount: number, hasMore: boolean) => {
      dispatch({ type: 'FETCH_SUCCESS', notes, totalCount, hasMore });
    },

    fetchError: (error: string) => {
      dispatch({ type: 'FETCH_ERROR', error });
    },

    setPage: (page: number) => {
      dispatch({ type: 'SET_PAGE', page });
    },

    setPaginationMode: (mode: 'regular' | 'infinite') => {
      dispatch({ type: 'SET_PAGINATION_MODE', mode });
    },
  }), []);

  // Simplified selectors
  const selectors = useMemo(() => ({
    isLoading: machineState.state === 'loading',
    isSuccess: machineState.state === 'success',
    isError: machineState.state === 'error',
    hasNotes: machineState.context.notes.length > 0,
    isEmpty: machineState.context.notes.length === 0 && machineState.state === 'success',
    hasError: !!machineState.context.error,
  }), [machineState]);

  return {
    // State
    state: machineState.state,
    
    // Context
    notes: machineState.context.notes,
    totalCount: machineState.context.totalCount,
    currentPage: machineState.context.currentPage,
    hasMore: machineState.context.hasMore,
    error: machineState.context.error,
    paginationMode: machineState.context.paginationMode,
    
    // Actions
    actions,
    
    // Selectors
    ...selectors,
  };
};

export default useNotesDataStateMachine;
