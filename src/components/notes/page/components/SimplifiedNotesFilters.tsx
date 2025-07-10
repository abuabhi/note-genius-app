import React from 'react';
import { UniversalFilters } from '@/components/shared/UniversalFilters';
import { useUserSubjects } from '@/hooks/useUserSubjects';

interface SimplifiedNotesFiltersProps {
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

export const SimplifiedNotesFilters = ({
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
}: SimplifiedNotesFiltersProps) => {
  console.log('🎯 [SIMPLIFIED NOTES FILTERS] Component rendering');
  
  console.log('🎯 [SIMPLIFIED NOTES FILTERS] Current state:', {
    searchTerm,
    selectedSubject,
    sortType,
    hasActiveFilters,
    activeFilterCount,
    loading,
    totalCount
  });

  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
  console.log('🎯 [SIMPLIFIED NOTES FILTERS] Subjects data:', {
    subjects: subjects?.map(s => s.name) || [],
    subjectsLoading
  });

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];

  console.log('🎯 [SIMPLIFIED NOTES FILTERS] About to render UniversalFilters with props:', {
    search: searchTerm,
    subject: selectedSubject,
    sort: sortType,
    subjects: subjects?.map(s => s.name) || [],
    sortOptions,
    hasActiveFilters,
    activeFilterCount,
    setSelectedSubjectType: typeof setSelectedSubject
  });

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