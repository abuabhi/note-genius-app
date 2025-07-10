
import React from 'react';
import { UniversalFilters } from '@/components/shared/UniversalFilters';
import { useUserSubjects } from '@/hooks/useUserSubjects';

interface NotesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  sortType: string;
  setSortType: (value: string) => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  clearFilters: () => void;
  loading: boolean;
  totalCount: number;
}

export const NotesFilters = ({
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
}: NotesFiltersProps) => {
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
        searchPlaceholder="Search notes by title..."
        enableArchived={false}
        isLoading={loading || subjectsLoading}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
      />
    </div>
  );
};
