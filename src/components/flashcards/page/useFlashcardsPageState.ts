
import { useState, useCallback } from 'react';

interface FlashcardFilters {
  search?: string;
  subject?: string;
  sortBy?: string;
}

const defaultFilters: FlashcardFilters = {
  search: '',
  subject: 'all',
  sortBy: 'updated_at'
};

export const useFlashcardsPageState = () => {
  const [filters, setFilters] = useState<FlashcardFilters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);

  const updateFilters = useCallback((newFilters: FlashcardFilters) => {
    console.log('🔄 Updating flashcard filters:', newFilters);
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
