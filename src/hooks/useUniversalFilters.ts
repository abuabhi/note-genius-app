import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface UniversalFiltersOptions {
  defaultSearch?: string;
  defaultSubject?: string;
  defaultSort?: string;
  defaultShowArchived?: boolean;
  debounceMs?: number;
}

export const useUniversalFilters = (options: UniversalFiltersOptions = {}) => {
  const {
    defaultSearch = '',
    defaultSubject = 'all',
    defaultSort = 'newest',
    defaultShowArchived = false,
    debounceMs = 300
  } = options;

  // Filter state
  const [search, setSearch] = useState(defaultSearch);
  const [subject, setSubject] = useState(defaultSubject);
  const [sort, setSort] = useState(defaultSort);
  const [showArchived, setShowArchived] = useState(defaultShowArchived);

  // Debounced search for query optimization
  const debouncedSearch = useDebounce(search, debounceMs);

  // Filter calculations
  const hasActiveFilters = useMemo(() => {
    return !!(search || 
             (subject && subject !== 'all') || 
             showArchived);
  }, [search, subject, showArchived]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (subject && subject !== 'all') count++;
    if (showArchived) count++;
    return count;
  }, [search, subject, showArchived]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    console.log('🧹 [UNIVERSAL FILTERS] Clearing all filters');
    setSearch(defaultSearch);
    setSubject(defaultSubject);
    setSort(defaultSort);
    setShowArchived(defaultShowArchived);
  }, [defaultSearch, defaultSubject, defaultSort, defaultShowArchived]);

  return {
    // Raw filter values
    search,
    subject,
    sort,
    showArchived,
    
    // Debounced value for queries
    debouncedSearch,
    
    // Setters
    setSearch,
    setSubject,
    setSort,
    setShowArchived,
    
    // Computed values
    hasActiveFilters,
    activeFilterCount,
    clearFilters
  };
};