import React, { useState, useMemo } from 'react';
import { useQuizList } from '@/hooks/quiz';
import { useFavoritesManager } from '@/hooks/quiz/useFavoritesManager';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/empty-state';
import { UniversalFilters } from '@/components/shared/UniversalFilters';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { QuizGrid } from './components/QuizGrid';
import { QuizListView } from './components/QuizListView';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/auth/useAuth';
import type { Quiz } from '@/types/quiz';

interface QuizListProps {
  viewMode: 'grid' | 'list';
}

const QuizList = ({ viewMode }: QuizListProps) => {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  
  const { favoriteQuizIds, toggleFavorite, getFavoriteCount } = useFavoritesManager();
  const { user } = useAuth();
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  const filters = useMemo(() => ({
    search: search || undefined,
    subject: subject === 'all' ? undefined : subject,
    page
  }), [search, subject, page]);

  const { data, isLoading, error, refetch } = useQuizList(filters);

  const hasActiveFilters = Boolean(search || (subject && subject !== 'all'));
  const activeFilterCount = [
    Boolean(search),
    Boolean(subject && subject !== 'all')
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setSubject('all');
    setSort('newest');
    setPage(1);
  };

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, subject]);

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
  const totalCount = data?.totalCount || 0;
  const hasMore = data?.hasMore || false;
  const favoriteCount = getFavoriteCount();

  // Transform the data to ensure it has all required Quiz properties with proper defaults
  const transformedQuizzes: Quiz[] = quizzes.map(quiz => ({
    ...quiz,
    user_subject_id: quiz.user_subject_id || null,
    section_id: quiz.section_id || null,
    source_type: (quiz.source_type as "custom" | "prebuilt" | "note") || 'custom',
    source_id: quiz.source_id || null,
    questionCount: quiz.questionCount || 0,
  }));

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-4">
        <UniversalFilters
          search={search}
          subject={subject}
          sort={sort}
          onSearchChange={setSearch}
          onSubjectChange={setSubject}
          onSortChange={setSort}
          subjects={subjects}
          sortOptions={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'alphabetical', label: 'Alphabetical' }
          ]}
          searchPlaceholder="Search quizzes..."
          enableArchived={false}
          isLoading={isLoading || subjectsLoading}
          totalCount={quizzes.length}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          {totalCount > 0 && (
            <span>
              Showing {quizzes.length} of {totalCount} quiz{totalCount === 1 ? '' : 'zes'}
            </span>
          )}
        </div>
        {favoriteCount > 0 && (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <BookOpen className="h-3 w-3 fill-current" />
            {favoriteCount} favorite{favoriteCount === 1 ? '' : 's'}
          </Badge>
        )}
      </div>

      {/* Quiz Display */}
      {transformedQuizzes.length === 0 && !isLoading ? (
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
      ) : viewMode === 'grid' ? (
        <QuizGrid
          quizzes={transformedQuizzes}
          onToggleFavorite={toggleFavorite}
          favoriteQuizIds={favoriteQuizIds}
          loading={isLoading && page === 1}
          isSelectable={false}
          selectedQuizIds={new Set()}
          onSelectionChange={() => {}}
          onRefresh={refetch}
          currentUserId={user?.id}
        />
      ) : (
        <QuizListView
          quizzes={transformedQuizzes}
          onToggleFavorite={toggleFavorite}
          favoriteQuizIds={favoriteQuizIds}
          loading={isLoading && page === 1}
          isSelectable={false}
          selectedQuizIds={new Set()}
          onSelectionChange={() => {}}
          onRefresh={refetch}
          currentUserId={user?.id}
        />
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              `Load More (${totalCount - quizzes.length} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizList;
