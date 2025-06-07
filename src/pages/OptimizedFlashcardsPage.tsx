
import Layout from '@/components/layout/Layout';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';
import { ProgressiveLoader } from '@/components/performance/ProgressiveLoader';
import { useOptimizedFlashcards } from '@/hooks/performance/useOptimizedFlashcards';
import FlashcardSetFilters from '@/components/flashcards/components/FlashcardSetFilters';
import FlashcardSetGrid from '@/components/flashcards/components/FlashcardSetGrid';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="container mx-auto p-4 md:p-6">
    <Alert variant="destructive">
      <AlertTitle>Flashcards Page Error</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p><strong>Error:</strong> {error.message}</p>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
            Try again
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  </div>
);

const OptimizedFlashcardsContent = () => {
  const {
    data,
    isLoading,
    currentPage,
    filters,
    handlePageChange,
    handleFilterChange,
    prefetchNextPage
  } = useOptimizedFlashcards();

  const handleCreateSet = () => {
    console.log('Navigate to create flashcard set');
  };

  const handleStudySet = (setId: string) => {
    console.log('Navigate to study set:', setId);
  };

  if (isLoading && data.sets.length === 0) {
    return (
      <ProgressiveLoader
        isLoading={true}
        skeletonCount={6}
      >
        <div></div>
      </ProgressiveLoader>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Flashcard Sets</h1>
          <p className="text-muted-foreground">
            Study with {data.totalCount} flashcard sets
          </p>
        </div>
        <Button onClick={handleCreateSet} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Set
        </Button>
      </div>

      {/* Filters */}
      <FlashcardSetFilters
        subjects={data.subjects}
        currentFilters={filters}
        onFiltersChange={handleFilterChange}
      />

      {/* Content */}
      <ProgressiveLoader
        isLoading={isLoading}
        isPartiallyLoaded={data.sets.length > 0}
        skeletonCount={3}
      >
        {data.sets.length > 0 ? (
          <FlashcardSetGrid
            sets={data.sets}
            onStudySet={handleStudySet}
            onEditSet={(setId) => console.log('Edit set:', setId)}
            onDeleteSet={(setId) => console.log('Delete set:', setId)}
          />
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No flashcard sets found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first flashcard set to start studying
            </p>
            <Button onClick={handleCreateSet}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Set
            </Button>
          </div>
        )}
      </ProgressiveLoader>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm">
              Page {currentPage} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === data.totalPages}
              onClick={() => {
                handlePageChange(currentPage + 1);
                prefetchNextPage();
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const OptimizedFlashcardsPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Flashcards" pageIcon={<BookOpen className="h-3 w-3" />} />
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => console.log('Resetting flashcards page error boundary')}
        >
          <OptimizedFlashcardsContent />
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
