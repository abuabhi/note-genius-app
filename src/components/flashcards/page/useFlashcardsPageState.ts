
import { useState, useCallback } from 'react';
import { FlashcardFilters } from '../components/AdvancedFlashcardFilters';

const defaultFilters: FlashcardFilters = {
  searchQuery: '',
  subjectFilter: 'all',
  difficultyFilter: 'all',
  progressFilter: 'all',
  sortBy: 'updated_at',
  sortOrder: 'desc',
  viewMode: 'grid',
  showPinnedOnly: false
};

export const useFlashcardsPageState = () => {
  const [filters, setFilters] = useState<FlashcardFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);

  const updateFilters = useCallback((newFilters: FlashcardFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setPage(1);
  }, []);

  return {
    filters,
    page,
    deletingSet,
    setFilters: updateFilters,
    setPage,
    setDeletingSet,
    resetFilters
  };
};
