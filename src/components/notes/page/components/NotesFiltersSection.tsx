import React from 'react';
import { SimplifiedNotesFilters } from './SimplifiedNotesFilters';
import { useServerSideNotes } from '@/hooks/useServerSideFilter';

// Use simplified implementation
export const NotesFiltersSection = () => {
  console.log('🔄 [NOTES FILTERS SECTION] Rendering - using simplified filters');
  
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
  } = useServerSideNotes();
  
  return (
    <SimplifiedNotesFilters
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedSubject={selectedSubject}
      setSelectedSubject={setSelectedSubject}
      sortType={sortType}
      setSortType={setSortType}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={activeFilterCount}
      clearFilters={clearFilters}
      loading={loading}
      totalCount={totalCount}
    />
  );
};