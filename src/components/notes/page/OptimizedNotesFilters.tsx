
import React, { memo } from 'react';
import { NotesFilters } from '@/components/notes/NotesFilters';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

export const OptimizedNotesFilters = memo(() => {
  const { 
    notes, 
    totalCount,
    searchTerm,
    setSearchTerm,
    selectedSubject,
    setSelectedSubject,
    showArchived,
    setShowArchived,
    sortType,
    setSortType,
    refreshNotes
  } = useOptimizedNotes();

  const handleFiltersChange = (filters: {
    search?: string;
    subject?: string;
    showArchived?: boolean;
  }) => {
    if (filters.search !== undefined) {
      setSearchTerm(filters.search);
    }
    if (filters.subject !== undefined) {
      setSelectedSubject(filters.subject || 'all');
    }
    if (filters.showArchived !== undefined) {
      setShowArchived(filters.showArchived);
    }
    
    // Force refresh to ensure fresh data
    setTimeout(() => {
      refreshNotes();
    }, 100);
  };

  const handleSortChange = (sort: string) => {
    setSortType(sort);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4">
      <NotesFilters
        onFiltersChange={handleFiltersChange}
        totalNotes={totalCount}
        searchTerm={searchTerm}
        selectedSubject={selectedSubject}
        showArchived={showArchived}
        sortType={sortType}
        onSortChange={handleSortChange}
      />
    </div>
  );
});

OptimizedNotesFilters.displayName = 'OptimizedNotesFilters';
