import React, { memo } from 'react';
import { UniversalFilters } from '@/components/shared/UniversalFilters';
import { useSimpleNotes } from '@/hooks/useSimpleNotes';
import { useUserSubjects } from '@/hooks/useUserSubjects';

export const NotesFiltersSection = memo(() => {
  const { 
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    sortType,
    setSortType,
    hasActiveFilters,
    activeFilterCount,
    clearFilters,
    loading,
    totalCount
  } = useSimpleNotes();

  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4">
      <UniversalFilters
        search={searchTerm}
        subject={selectedSubject}
        sort={sortType}
        onSearchChange={setSearchTerm}
        onSubjectChange={setSelectedSubject}
        onSortChange={setSortType}
        subjects={subjects}
        sortOptions={sortOptions}
        searchPlaceholder="Search notes..."
        enableArchived={false}
        isLoading={loading || subjectsLoading}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
      />
    </div>
  );
});

NotesFiltersSection.displayName = 'NotesFiltersSection';