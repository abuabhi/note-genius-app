
import { useReducer, useCallback, useMemo } from 'react';
import { Note } from '@/types/note';

// Data state machine types
export type DataState = 
  | 'idle'
  | 'initial_loading'
  | 'background_loading'
  | 'refreshing'
  | 'paginating'
  | 'filtering'
  | 'success'
  | 'error'
  | 'retrying';

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
  | { type: 'START_INITIAL_LOAD' }
  | { type: 'START_BACKGROUND_LOAD' }
  | { type: 'START_REFRESH' }
  | { type: 'START_PAGINATE' }
  | { type: 'START_FILTER' }
  | { type: 'FETCH_SUCCESS'; notes: Note[]; totalCount: number; hasMore: boolean; append?: boolean }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'START_RETRY' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_PAGINATION_MODE'; mode: 'regular' | 'infinite' }
  | { type: 'RESET_STATE' };

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

const initialState: DataMachineState = {
  state: 'idle',
  context: initialContext,
};

const MAX_RETRY_ATTEMPTS = 3;

function dataReducer(state: DataMachineState, event: DataEvent): DataMachineState {
  switch (event.type) {
    case 'START_INITIAL_LOAD':
      return {
        ...state,
        state: 'initial_loading',
        context: {
          ...state.context,
          error: null,
          retryCount: 0,
        },
      };

    case 'START_BACKGROUND_LOAD':
      return {
        ...state,
        state: 'background_loading',
        context: {
          ...state.context,
          error: null,
        },
      };

    case 'START_REFRESH':
      return {
        ...state,
        state: 'refreshing',
        context: {
          ...state.context,
          error: null,
          retryCount: 0,
        },
      };

    case 'START_PAGINATE':
      return {
        ...state,
        state: 'paginating',
        context: {
          ...state.context,
          error: null,
        },
      };

    case 'START_FILTER':
      return {
        ...state,
        state: 'filtering',
        context: {
          ...state.context,
          error: null,
          currentPage: 1, // Reset to first page when filtering
        },
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        state: 'success',
        context: {
          ...state.context,
          notes: event.append ? [...state.context.notes, ...event.notes] : event.notes,
          totalCount: event.totalCount,
          hasMore: event.hasMore,
          error: null,
          retryCount: 0,
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
          retryCount: state.context.retryCount + 1,
        },
      };

    case 'START_RETRY':
      if (state.context.retryCount >= MAX_RETRY_ATTEMPTS) {
        return state; // Don't retry if max attempts reached
      }
      return {
        ...state,
        state: 'retrying',
        context: {
          ...state.context,
          error: null,
        },
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        state: 'idle',
        context: {
          ...state.context,
          error: null,
          retryCount: 0,
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
          currentPage: 1, // Reset to first page when changing mode
        },
      };

    case 'RESET_STATE':
      return {
        state: 'idle',
        context: {
          ...initialContext,
          paginationMode: state.context.paginationMode, // Preserve pagination mode
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

  // Action creators
  const actions = useMemo(() => ({
    startInitialLoad: () => {
      dispatch({ type: 'START_INITIAL_LOAD' });
    },

    startBackgroundLoad: () => {
      dispatch({ type: 'START_BACKGROUND_LOAD' });
    },

    startRefresh: () => {
      dispatch({ type: 'START_REFRESH' });
    },

    startPaginate: () => {
      dispatch({ type: 'START_PAGINATE' });
    },

    startFilter: () => {
      dispatch({ type: 'START_FILTER' });
    },

    fetchSuccess: (notes: Note[], totalCount: number, hasMore: boolean, append = false) => {
      dispatch({ type: 'FETCH_SUCCESS', notes, totalCount, hasMore, append });
    },

    fetchError: (error: string) => {
      dispatch({ type: 'FETCH_ERROR', error });
    },

    startRetry: () => {
      dispatch({ type: 'START_RETRY' });
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },

    setPage: (page: number) => {
      dispatch({ type: 'SET_PAGE', page });
    },

    setPaginationMode: (mode: 'regular' | 'infinite') => {
      dispatch({ type: 'SET_PAGINATION_MODE', mode });
    },

    resetState: () => {
      dispatch({ type: 'RESET_STATE' });
    },
  }), []);

  // Selectors
  const selectors = useMemo(() => ({
    // State selectors
    isIdle: machineState.state === 'idle',
    isInitialLoading: machineState.state === 'initial_loading',
    isBackgroundLoading: machineState.state === 'background_loading',
    isRefreshing: machineState.state === 'refreshing',
    isPaginating: machineState.state === 'paginating',
    isFiltering: machineState.state === 'filtering',
    isSuccess: machineState.state === 'success',
    isError: machineState.state === 'error',
    isRetrying: machineState.state === 'retrying',
    
    // General loading state
    loading: ['initial_loading', 'background_loading', 'refreshing', 'paginating', 'filtering', 'retrying'].includes(machineState.state),
    
    // Data state selectors
    hasNotes: machineState.context.notes.length > 0,
    isEmpty: machineState.context.notes.length === 0 && !['initial_loading', 'background_loading', 'retrying'].includes(machineState.state),
    hasError: !!machineState.context.error,
    canRetry: machineState.context.retryCount < MAX_RETRY_ATTEMPTS && !!machineState.context.error,
    
    // Data freshness
    isDataStale: machineState.context.lastFetchTime ? (Date.now() - machineState.context.lastFetchTime) > 300000 : true, // 5 minutes
  }), [machineState]);

  // Retry function with exponential backoff
  const retry = useCallback(async () => {
    if (!selectors.canRetry) return;
    
    actions.startRetry();
    
    // Exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, machineState.context.retryCount), 10000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // The actual retry logic will be handled by the consuming component
  }, [selectors.canRetry, actions, machineState.context.retryCount]);

  return {
    // State
    state: machineState.state,
    
    // Context
    notes: machineState.context.notes,
    totalCount: machineState.context.totalCount,
    currentPage: machineState.context.currentPage,
    hasMore: machineState.context.hasMore,
    error: machineState.context.error,
    retryCount: machineState.context.retryCount,
    lastFetchTime: machineState.context.lastFetchTime,
    paginationMode: machineState.context.paginationMode,
    
    // Actions
    actions,
    
    // Selectors
    ...selectors,
    
    // Enhanced functions
    retry,
    
    // Debug info
    debug: {
      state: machineState.state,
      context: machineState.context,
      canRetry: selectors.canRetry,
      isDataStale: selectors.isDataStale,
    },
  };
};

export default useNotesDataStateMachine;
