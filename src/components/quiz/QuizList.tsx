
import React, { useState } from 'react';
import { useQuizList } from '@/hooks/quiz';
import { useQuizFilterOptions } from '@/hooks/quiz/useQuizFilterOptions';
import { useFavoritesManager } from '@/hooks/quiz/useFavoritesManager';
import { useDeleteQuiz } from '@/hooks/quiz/useDeleteQuiz';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/empty-state';
import { QuizFilters } from './QuizFilters';
import { QuizGrid } from './components/QuizGrid';
import { QuizListView } from './components/QuizListView';
import { ViewToggle } from './components/ViewToggle';
import { BulkQuizActions } from './components/BulkQuizActions';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from '@/hooks/use-toast';

const QuizList = () => {
  const [filters, setFilters] = useState<{
    search?: string;
    subject?: string;
    grade?: string;
    userOnly?: boolean;
  }>({});
  
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedQuizIds, setSelectedQuizIds] = useState<Set<string>>(new Set());
  
  const { favoriteQuizIds, toggleFavorite, isFavorite, getFavoriteCount } = useFavoritesManager();
  const { user } = useAuth();
  const { mutateAsync: deleteQuiz } = useDeleteQuiz();

  const { data, isLoading, error, refetch } = useQuizList(filters);
  const { data: filterOptions, isLoading: optionsLoading } = useQuizFilterOptions();

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleSelectionChange = (quizId: string, selected: boolean) => {
    setSelectedQuizIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(quizId);
      } else {
        newSet.delete(quizId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (quizzes.length > 0) {
      setSelectedQuizIds(new Set(quizzes.map(q => q.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedQuizIds(new Set());
    setSelectionMode(false);
  };

  const handleBulkDelete = async (quizIds: string[]) => {
    try {
      await Promise.all(quizIds.map(id => deleteQuiz(id)));
      toast({
        title: "Success",
        description: `${quizIds.length} quiz${quizIds.length === 1 ? '' : 'es'} deleted successfully.`,
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedQuizIds(new Set());
    }
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
              <BookOpen className="h-3 w-3 fill-current" />
              {favoriteCount} favorite{favoriteCount === 1 ? '' : 's'}
            </Badge>
          )}
          {selectedQuizIds.size > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 bg-mint-50 text-mint-700 border-mint-200">
              <Settings className="h-3 w-3" />
              {selectedQuizIds.size} selected
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectionMode}
            className={`${selectionMode ? 'bg-mint-50 text-mint-700 border-mint-200' : ''}`}
          >
            <Settings className="h-4 w-4 mr-2" />
            {selectionMode ? 'Exit Selection' : 'Manage'}
          </Button>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
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
          isSelectable={selectionMode}
          selectedQuizIds={selectedQuizIds}
          onSelectionChange={handleSelectionChange}
          onRefresh={refetch}
          currentUserId={user?.id}
        />
      ) : (
        <QuizListView
          quizzes={quizzes}
          onToggleFavorite={toggleFavorite}
          favoriteQuizIds={favoriteQuizIds}
          loading={isLoading}
          isSelectable={selectionMode}
          selectedQuizIds={selectedQuizIds}
          onSelectionChange={handleSelectionChange}
          onRefresh={refetch}
          currentUserId={user?.id}
        />
      )}

      {/* Bulk Actions */}
      {selectionMode && (
        <BulkQuizActions
          selectedQuizIds={selectedQuizIds}
          totalQuizzes={totalQuizzes}
          onClearSelection={handleClearSelection}
          onSelectAll={handleSelectAll}
          onBulkDelete={handleBulkDelete}
          onRefresh={refetch}
        />
      )}
    </div>
  );
};

export default QuizList;
