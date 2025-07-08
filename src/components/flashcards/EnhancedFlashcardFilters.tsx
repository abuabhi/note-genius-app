import React from 'react';
import { UniversalFilters } from '@/components/shared/UniversalFilters';
import { useUniversalFilters } from '@/hooks/useUniversalFilters';
import { useUserSubjects } from '@/hooks/useUserSubjects';

interface EnhancedFlashcardFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    subject?: string;
    sortBy?: string;
  }) => void;
  totalSets: number;
  isLoading?: boolean;
}

export const EnhancedFlashcardFilters: React.FC<EnhancedFlashcardFiltersProps> = ({
  onFiltersChange,
  totalSets,
  isLoading = false
}) => {
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
  const {
    search,
    subject,
    sort,
    debouncedSearch,
    setSearch,
    setSubject,
    setSort,
    hasActiveFilters,
    activeFilterCount,
    clearFilters
  } = useUniversalFilters({
    defaultSort: 'updated_at',
    debounceMs: 300
  });

  // Notify parent of filter changes (using debounced search)
  React.useEffect(() => {
    onFiltersChange({
      search: debouncedSearch || undefined,
      subject: subject === 'all' ? undefined : subject,
      sortBy: sort
    });
  }, [debouncedSearch, subject, sort, onFiltersChange]);

  const sortOptions = [
    { value: 'updated_at', label: 'Recently Updated' },
    { value: 'created_at', label: 'Recently Created' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'card_count', label: 'Card Count' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4">
      <UniversalFilters
        search={search}
        subject={subject}
        sort={sort}
        onSearchChange={setSearch}
        onSubjectChange={setSubject}
        onSortChange={setSort}
        subjects={subjects}
        sortOptions={sortOptions}
        searchPlaceholder="Search flashcard sets..."
        isLoading={isLoading || subjectsLoading}
        totalCount={totalSets}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
      />
    </div>
  );
};