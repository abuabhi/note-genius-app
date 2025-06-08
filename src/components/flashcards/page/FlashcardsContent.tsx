
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import FlashcardSetListView from '@/components/flashcards/components/FlashcardSetListView';
import FlashcardSetGrid from '@/components/flashcards/components/FlashcardSetGrid';
import type { FlashcardFilters } from '@/components/flashcards/components/AdvancedFlashcardFilters';

// Loading skeleton component
const ListLoadingSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white border border-mint-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="text-center py-12">
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
      <p className="text-red-600 mb-4">Error loading flashcard sets: {error}</p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  </div>
);

interface FlashcardsContentProps {
  sets: any[];
  filters: FlashcardFilters;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  deletingSet: string | null;
  detailedProgressData: Record<string, any>;
  onDeleteSet: (setId: string) => void;
  onTogglePinned: (setId: string, isPinned: boolean) => void;
  onLoadMore: () => void;
  onRetry: () => void;
}

export const FlashcardsContent = ({
  sets,
  filters,
  loading,
  error,
  hasMore,
  page,
  deletingSet,
  detailedProgressData,
  onDeleteSet,
  onTogglePinned,
  onLoadMore,
  onRetry,
}: FlashcardsContentProps) => {
  if (loading && page === 1) {
    return <ListLoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  const setProgressData = sets.reduce((acc: Record<string, number>, set) => {
    acc[set.id] = set.progress_summary?.mastery_percentage || 0;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Flashcard Sets Display */}
      {filters.viewMode === 'list' ? (
        <FlashcardSetListView
          sets={sets}
          onDeleteSet={onDeleteSet}
          onTogglePinned={onTogglePinned}
          deletingSet={deletingSet}
          detailedProgressData={detailedProgressData}
        />
      ) : (
        <FlashcardSetGrid
          sets={sets}
          setProgressData={setProgressData}
          deletingSet={deletingSet}
          onDeleteSet={onDeleteSet}
          hasInitiallyLoaded={!loading}
          searchQuery={filters.searchQuery}
          subjectFilter={filters.subjectFilter}
          detailedProgressData={detailedProgressData}
        />
      )}

      {/* Load More / Pagination */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={loading}
            className="px-8"
          >
            {loading ? 'Loading...' : 'Load More Sets'}
          </Button>
        </div>
      )}

      {/* Loading indicator for additional pages */}
      {loading && page > 1 && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-mint-300 border-t-transparent rounded-full animate-spin"></div>
            Loading more sets...
          </div>
        </div>
      )}

      {/* No more results indicator */}
      {!hasMore && sets.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          No more flashcard sets to load
        </div>
      )}
    </div>
  );
};
