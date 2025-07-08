
import React, { memo, useState, useEffect } from 'react';
import { UniversalFilters } from '@/components/shared/UniversalFilters';
import { useSimpleNotes } from '@/hooks/useSimpleNotes';
import { useUserSubjects } from '@/hooks/useUserSubjects';

export const OptimizedNotesFilters = memo(() => {
  const { 
    totalCount,
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    showArchived,
    setShowArchived,
    sortType,
    setSortType,
    hasActiveFilters,
    activeFilterCount,
    clearFilters,
    loading
  } = useSimpleNotes();

  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  // Local search state for instant UI updates
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchTerm]);

  // Sync local search with external changes
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Sort options for notes
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4">
      <UniversalFilters
        search={localSearch}
        subject={selectedSubject}
        sort={sortType}
        showArchived={showArchived}
        onSearchChange={setLocalSearch}
        onSubjectChange={setSelectedSubject}
        onSortChange={setSortType}
        onShowArchivedChange={setShowArchived}
        subjects={subjects}
        sortOptions={sortOptions}
        searchPlaceholder="Search notes..."
        enableArchived={true}
        isLoading={loading || subjectsLoading}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
      />
    </div>
  );
});

OptimizedNotesFilters.displayName = 'OptimizedNotesFilters';
