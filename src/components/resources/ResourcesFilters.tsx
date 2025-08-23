import React from 'react';
import { UniversalFilters } from '@/components/shared/UniversalFilters';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { RESOURCE_TYPES } from '@/components/resources/utils/resourceTypes';

interface ResourcesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedResourceType: string;
  setSelectedResourceType: (value: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (value: string) => void;
  showFavorites: boolean;
  setShowFavorites: (value: boolean) => void;
  sortType: string;
  setSortType: (value: string) => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  clearFilters: () => void;
  loading: boolean;
  totalCount: number;
}

export const ResourcesFilters = ({
  searchTerm,
  setSearchTerm,
  selectedSubject,
  setSelectedSubject,
  selectedResourceType,
  setSelectedResourceType,
  selectedDifficulty,
  setSelectedDifficulty,
  showFavorites,
  setShowFavorites,
  sortType,
  setSortType,
  hasActiveFilters,
  activeFilterCount,
  clearFilters,
  loading,
  totalCount
}: ResourcesFiltersProps) => {
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'most_accessed', label: 'Most Accessed' },
  ];

  const resourceTypeOptions = [
    { value: 'all', label: 'All Types' },
    ...RESOURCE_TYPES.map(type => ({
      value: type.type,
      label: type.label
    }))
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
      <UniversalFilters
        search={searchTerm}
        subject={selectedSubject}
        sort={sortType}
        onSearchChange={setSearchTerm}
        onSubjectChange={setSelectedSubject}
        onSortChange={setSortType}
        subjects={subjects}
        sortOptions={sortOptions}
        searchPlaceholder="Search resources by title..."
        enableArchived={false}
        isLoading={loading || subjectsLoading}
        totalCount={totalCount}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
      />
      
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource Type
          </label>
          <select
            value={selectedResourceType}
            onChange={(e) => setSelectedResourceType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {resourceTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {difficultyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFavorites}
              onChange={(e) => setShowFavorites(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              Favorites Only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};