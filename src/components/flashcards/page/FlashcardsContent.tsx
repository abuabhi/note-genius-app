
import React from 'react';
import { useFlashcards } from '@/contexts/FlashcardContext';
import FlashcardSetGrid from '@/components/flashcards/components/FlashcardSetGrid';
import { LoadingState } from '@/components/notes/page/LoadingState';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useFlashcardsPageState } from './useFlashcardsPageState';

export const FlashcardsContent = () => {
  const navigate = useNavigate();
  const { filters } = useFlashcardsPageState();
  const { 
    flashcardSets, 
    loading
  } = useFlashcards();

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
