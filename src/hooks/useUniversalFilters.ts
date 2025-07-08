import { useState, useCallback, useMemo, useEffect } from 'react';

export interface FilterState {
  search: string;
  subject: string;
  sort: string;
  showArchived?: boolean;
}

export interface FilterOptions {
  defaultSort?: string;
  defaultSubject?: string;
  enableArchived?: boolean;
  searchPlaceholder?: string;
  debounceMs?: number;
}

export interface UniversalFiltersReturn {
  // Filter values
  search: string;
  subject: string;
  sort: string;
  showArchived: boolean;
  
  // Debounced values (for queries)
  debouncedSearch: string;
  
  // Setters
  setSearch: (value: string) => void;
  setSubject: (value: string) => void;
  setSort: (value: string) => void;
  setShowArchived: (value: boolean) => void;
  
  // Computed values
  hasActiveFilters: boolean;
  activeFilterCount: number;
  clearFilters: () => void;
  
  // For query keys
  queryFilters: {
    search: string;
    subject: string;
    sort: string;
    showArchived?: boolean;
  };
}

// Custom debounce hook
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useUniversalFilters = (options: FilterOptions = {}): UniversalFiltersReturn => {
  const {
    defaultSort = 'newest',
    defaultSubject = 'all',
    enableArchived = false,
    debounceMs = 300
  } = options;

  // Filter state
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [sort, setSort] = useState(defaultSort);
  const [showArchived, setShowArchived] = useState(false);

  // Debounced search for performance
  const debouncedSearch = useDebounce(search, debounceMs);

  // Optimized setters with immediate UI update
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleSubjectChange = useCallback((value: string) => {
    setSubject(value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSort(value);
  }, []);

  const handleShowArchivedChange = useCallback((value: boolean) => {
    setShowArchived(value);
  }, []);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      search || 
      (subject && subject !== 'all') || 
      (enableArchived && showArchived)
    );
  }, [search, subject, showArchived, enableArchived]);

  const activeFilterCount = useMemo(() => {
    return [
      Boolean(search),
      Boolean(subject && subject !== 'all'),
      Boolean(enableArchived && showArchived)
    ].filter(Boolean).length;
  }, [search, subject, showArchived, enableArchived]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearch('');
    setSubject(defaultSubject);
    setSort(defaultSort);
    if (enableArchived) {
      setShowArchived(false);
    }
  }, [defaultSort, defaultSubject, enableArchived]);

  // Query filters object (for React Query keys)
  const queryFilters = useMemo(() => {
    const filters: any = {
      search: debouncedSearch,
      subject: subject === 'all' ? '' : subject,
      sort
    };
    
    if (enableArchived) {
      filters.showArchived = showArchived;
    }
    
    return filters;
  }, [debouncedSearch, subject, sort, showArchived, enableArchived]);

  return {
    // Current filter values
    search,
    subject,
    sort,
    showArchived,
    
    // Debounced values
    debouncedSearch,
    
    // Setters (optimized)
    setSearch: handleSearchChange,
    setSubject: handleSubjectChange,
    setSort: handleSortChange,
    setShowArchived: handleShowArchivedChange,
    
    // Computed values
    hasActiveFilters,
    activeFilterCount,
    clearFilters,
    
    // For queries
    queryFilters
  };
};