
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FlashcardFilters } from '@/components/flashcards/components/AdvancedFlashcardFilters';

export const useFlashcardsPageState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);

  // Initialize filters from URL params with validation
  const [filters, setFilters] = useState<FlashcardFilters>(() => ({
    searchQuery: searchParams.get('search') || '',
    subjectFilter: searchParams.get('subject') || undefined,
    timeFilter: (['all', 'week', 'month', 'quarter'].includes(searchParams.get('time') || '')) 
      ? (searchParams.get('time') as any) 
      : 'all',
    showPinnedOnly: searchParams.get('pinned') === 'true',
    sortBy: (['updated_at', 'created_at', 'name', 'card_count', 'progress'].includes(searchParams.get('sort') || '')) 
      ? (searchParams.get('sort') as any) 
      : 'updated_at',
    viewMode: (['list', 'grid'].includes(searchParams.get('view') || '')) 
      ? (searchParams.get('view') as any) 
      : 'list',
  }));

  // Update URL when filters change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.searchQuery?.trim()) params.set('search', filters.searchQuery.trim());
      if (filters.subjectFilter?.trim()) params.set('subject', filters.subjectFilter.trim());
      if (filters.timeFilter !== 'all') params.set('time', filters.timeFilter);
      if (filters.showPinnedOnly) params.set('pinned', 'true');
      if (filters.sortBy !== 'updated_at') params.set('sort', filters.sortBy);
      if (filters.viewMode !== 'list') params.set('view', filters.viewMode);
      
      setSearchParams(params, { replace: true });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, setSearchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  return {
    filters,
    setFilters,
    page,
    setPage,
    deletingSet,
    setDeletingSet,
  };
};
