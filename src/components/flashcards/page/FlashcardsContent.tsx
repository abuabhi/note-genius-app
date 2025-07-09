
import React from 'react';
import { useFlashcards } from '@/contexts/FlashcardContext';
import FlashcardSetGrid from '@/components/flashcards/components/FlashcardSetGrid';
import { LoadingState } from '@/components/notes/page/LoadingState';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useFlashcardsPageState } from './useFlashcardsPageState';
import { UniversalFilters } from '@/components/shared/UniversalFilters';
import { useUserSubjects } from '@/hooks/useUserSubjects';

export const FlashcardsContent = () => {
  const navigate = useNavigate();
  const { filters, setFilters } = useFlashcardsPageState();
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  const { 
    flashcardSets, 
    loading
  } = useFlashcards();

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = Boolean(
    filters.search || 
    (filters.subject && filters.subject !== 'all')
  );

  const activeFilterCount = [
    Boolean(filters.search),
    Boolean(filters.subject && filters.subject !== 'all')
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      search: '',
      subject: 'all',
      sortBy: 'updated_at'
    });
  };

  if (loading.sets) {
    return <LoadingState />;
  }

  if (!flashcardSets || flashcardSets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <EmptyState
          icon={<BookOpen className="h-16 w-16" />}
          title="No flashcard sets yet"
          description="Create your first flashcard set to get started with studying"
          action={
            <Button onClick={() => navigate('/flashcards/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Flashcard Set
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Universal Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4">
        <UniversalFilters
          search={filters.search || ''}
          subject={filters.subject || 'all'}
          sort={filters.sortBy || 'updated_at'}
          onSearchChange={(search) => handleFiltersChange({ ...filters, search })}
          onSubjectChange={(subject) => handleFiltersChange({ ...filters, subject })}
          onSortChange={(sortBy) => handleFiltersChange({ ...filters, sortBy })}
          subjects={subjects}
          sortOptions={[
            { value: 'updated_at', label: 'Recently Updated' },
            { value: 'created_at', label: 'Recently Created' },
            { value: 'name', label: 'Name A-Z' }
          ]}
          searchPlaceholder="Search flashcard sets..."
          enableArchived={false}
          isLoading={loading.sets || subjectsLoading}
          totalCount={flashcardSets?.length || 0}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onClearFilters={clearFilters}
        />
      </div>

      <FlashcardSetGrid
        sets={flashcardSets}
        setProgressData={{}}
        deletingSet={null}
        onDeleteSet={() => {}}
        hasInitiallyLoaded={true}
        searchQuery={filters.search || ""}
        subjectFilter={filters.subject !== 'all' ? filters.subject : undefined}
      />
    </div>
  );
};
