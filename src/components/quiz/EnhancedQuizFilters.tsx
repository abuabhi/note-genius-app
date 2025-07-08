import React from 'react';
import { UniversalFilters } from '@/components/shared/UniversalFilters';
import { useUniversalFilters } from '@/hooks/useUniversalFilters';
import { useUserSubjects } from '@/hooks/useUserSubjects';

interface EnhancedQuizFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    subject?: string;
  }) => void;
  totalQuizzes: number;
  isLoading?: boolean;
}

export const EnhancedQuizFilters: React.FC<EnhancedQuizFiltersProps> = ({
  onFiltersChange,
  totalQuizzes,
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
    defaultSort: 'newest',
    debounceMs: 300
  });

  // Notify parent of filter changes (using debounced search)
  React.useEffect(() => {
    onFiltersChange({
      search: debouncedSearch || undefined,
      subject: subject === 'all' ? undefined : subject
    });
  }, [debouncedSearch, subject, onFiltersChange]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'difficulty', label: 'By Difficulty' }
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
        searchPlaceholder="Search quizzes..."
        isLoading={isLoading || subjectsLoading}
        totalCount={totalQuizzes}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
      />
    </div>
  );
};