import { useReducer, useCallback, useMemo } from 'react';

// Filter state machine types
export type FilterState = 
  | 'idle'
  | 'filtering'
  | 'filter_success'
  | 'filter_error';

export interface FilterContext {
  searchTerm: string;
  sortType: string;
  showArchived: boolean;
  selectedSubject: string;
  error: string | null;
}

type FilterEvent = 
  | { type: 'SET_SEARCH_TERM'; searchTerm: string }
  | { type: 'SET_SORT_TYPE'; sortType: string }
  | { type: 'SET_SHOW_ARCHIVED'; showArchived: boolean }
  | { type: 'SET_SELECTED_SUBJECT'; selectedSubject: string }
  | { type: 'START_FILTER' }
  | { type: 'FILTER_SUCCESS' }
  | { type: 'FILTER_ERROR'; error: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'RESET_ERROR' };

interface FilterMachineState {
  state: FilterState;
  context: FilterContext;
}

const initialContext: FilterContext = {
  searchTerm: '',
  sortType: 'newest',
  showArchived: false,
  selectedSubject: 'all',
  error: null,
};

const initialState: FilterMachineState = {
  state: 'idle',
  context: initialContext,
};

function filterReducer(state: FilterMachineState, event: FilterEvent): FilterMachineState {
  switch (event.type) {
    case 'SET_SEARCH_TERM':
      return {
        ...state,
        state: 'filtering',
        context: {
          ...state.context,
          searchTerm: event.searchTerm,
          error: null,
        },
      };

    case 'SET_SORT_TYPE':
      return {
        ...state,
        state: 'filtering',
        context: {
          ...state.context,
          sortType: event.sortType,
          error: null,
        },
      };

    case 'SET_SHOW_ARCHIVED':
      return {
        ...state,
        state: 'filtering',
        context: {
          ...state.context,
          showArchived: event.showArchived,
          error: null,
        },
      };

    case 'SET_SELECTED_SUBJECT':
      return {
        ...state,
        state: 'filtering',
        context: {
          ...state.context,
          selectedSubject: event.selectedSubject,
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
        },
      };

    case 'FILTER_SUCCESS':
      return {
        ...state,
        state: 'filter_success',
      };

    case 'FILTER_ERROR':
      return {
        ...state,
        state: 'filter_error',
        context: {
          ...state.context,
          error: event.error,
        },
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        state: 'idle',
        context: {
          ...initialContext,
          // Keep sort type and archived state when clearing
          sortType: state.context.sortType,
          showArchived: state.context.showArchived,
        },
      };

    case 'RESET_ERROR':
      return {
        ...state,
        state: 'idle',
        context: {
          ...state.context,
          error: null,
        },
      };

    default:
      return state;
  }
}

/**
 * Filter state machine hook for managing all filtering operations
 */
export const useNotesFilterStateMachine = () => {
  const [machineState, dispatch] = useReducer(filterReducer, initialState);

  // Action creators
  const actions = useMemo(() => ({
    setSearchTerm: (searchTerm: string) => {
      dispatch({ type: 'SET_SEARCH_TERM', searchTerm });
    },

    setSortType: (sortType: string) => {
      dispatch({ type: 'SET_SORT_TYPE', sortType });
    },

    setShowArchived: (showArchived: boolean) => {
      dispatch({ type: 'SET_SHOW_ARCHIVED', showArchived });
    },

    setSelectedSubject: (selectedSubject: string) => {
      dispatch({ type: 'SET_SELECTED_SUBJECT', selectedSubject });
    },

    startFilter: () => {
      dispatch({ type: 'START_FILTER' });
    },

    filterSuccess: () => {
      dispatch({ type: 'FILTER_SUCCESS' });
    },

    filterError: (error: string) => {
      dispatch({ type: 'FILTER_ERROR', error });
    },

    clearFilters: () => {
      dispatch({ type: 'CLEAR_FILTERS' });
    },

    resetError: () => {
      dispatch({ type: 'RESET_ERROR' });
    },
  }), []);

  // Selectors
  const selectors = useMemo(() => ({
    // State selectors
    isIdle: machineState.state === 'idle',
    isFiltering: machineState.state === 'filtering',
    isFilterSuccess: machineState.state === 'filter_success',
    isFilterError: machineState.state === 'filter_error',
    
    // Context selectors
    hasActiveFilters: !!(
      machineState.context.searchTerm ||
      machineState.context.selectedSubject !== 'all' ||
      machineState.context.showArchived
    ),
    
    hasError: !!machineState.context.error,
    
    // Filter count for UI
    activeFilterCount: [
      machineState.context.searchTerm,
      machineState.context.selectedSubject !== 'all' ? machineState.context.selectedSubject : null,
      machineState.context.showArchived ? 'archived' : null,
    ].filter(Boolean).length,
  }), [machineState]);

  return {
    // State
    state: machineState.state,
    
    // Context
    searchTerm: machineState.context.searchTerm,
    sortType: machineState.context.sortType,
    showArchived: machineState.context.showArchived,
    selectedSubject: machineState.context.selectedSubject,
    error: machineState.context.error,
    
    // Actions
    actions,
    
    // Selectors
    ...selectors,
    
    // Debug info
    debug: {
      state: machineState.state,
      context: machineState.context,
    },
  };
};

export default useNotesFilterStateMachine;
