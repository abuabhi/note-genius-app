
import React, { useState } from 'react';
import { useQuizList } from '@/hooks/quiz';
import { useQuizFilterOptions } from '@/hooks/quiz/useQuizFilterOptions';
import { useFavoritesManager } from '@/hooks/quiz/useFavoritesManager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/empty-state';
import { QuizFilters } from './QuizFilters';
import { QuizGrid } from './components/QuizGrid';
import { QuizListView } from './components/QuizListView';
import { ViewToggle } from './components/ViewToggle';
import { Badge } from '@/components/ui/badge';

const QuizList = () => {
  const [filters, setFilters] = useState<{
    search?: string;
    subject?: string;
    grade?: string;
    section?: string;
    userOnly?: boolean;
  }>({});
  
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { favoriteQuizIds, toggleFavorite, isFavorite, getFavoriteCount } = useFavoritesManager();

  const { data, isLoading, error } = useQuizList(filters);
  const { data: filterOptions, isLoading: optionsLoading } = useQuizFilterOptions();

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading quizzes</p>
          <p className="text-sm text-gray-600 mt-1">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </Card>
    );
  }

  const quizzes = data?.quizzes || [];
  const totalQuizzes = quizzes.length;
  const favoriteCount = getFavoriteCount();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <QuizFilters
        onFiltersChange={handleFiltersChange}
        subjects={filterOptions?.subjects || []}
        grades={filterOptions?.grades || []}
        sections={filterOptions?.sections || []}
        isLoading={isLoading}
        totalQuizzes={totalQuizzes}
      />

      {/* View Toggle and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {totalQuizzes > 0 && (
              <span>{totalQuizzes} quiz{totalQuizzes === 1 ? '' : 'es'} found</span>
            )}
          </div>
          {favoriteCount > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
              <Heart className="h-3 w-3 fill-current" />
              {favoriteCount} favorite{favoriteCount === 1 ? '' : 's'}
            </Badge>
          )}
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Quiz Display */}
      {quizzes.length === 0 && !isLoading ? (
        <EmptyState
          title="No quizzes found"
          description={
            Object.values(filters).some(Boolean)
              ? "No quizzes match your current filters. Try adjusting your search criteria."
              : "Get started by creating your first quiz or check if there are any public quizzes available."
          }
          icon={<BookOpen className="h-8 w-8 text-gray-400" />}
          action={
            <Button asChild className="bg-mint-600 hover:bg-mint-700">
              <Link to="/quiz/create">
                Create Your First Quiz
              </Link>
            </Button>
          }
        />
      ) : view === 'grid' ? (
        <QuizGrid
          quizzes={quizzes}
          onToggleFavorite={toggleFavorite}
          favoriteQuizIds={favoriteQuizIds}
          loading={isLoading}
        />
      ) : (
        <QuizListView
          quizzes={quizzes}
          onToggleFavorite={toggleFavorite}
          favoriteQuizIds={favoriteQuizIds}
          loading={isLoading}
        />
      )}
    </div>
  );
};

export default QuizList;
