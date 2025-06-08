
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { useEnhancedFlashcardSets } from '@/hooks/useEnhancedFlashcardSets';
import AdvancedFlashcardFilters, { FlashcardFilters } from '@/components/flashcards/components/AdvancedFlashcardFilters';
import FlashcardSetListView from '@/components/flashcards/components/FlashcardSetListView';
import FlashcardSetGrid from '@/components/flashcards/components/FlashcardSetGrid';

// Loading skeleton for the list view
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

const OptimizedFlashcardsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FlashcardFilters>(() => ({
    searchQuery: searchParams.get('search') || '',
    subjectFilter: searchParams.get('subject') || undefined,
    timeFilter: (searchParams.get('time') as any) || 'all',
    showPinnedOnly: searchParams.get('pinned') === 'true',
    sortBy: (searchParams.get('sort') as any) || 'updated_at',
    viewMode: (searchParams.get('view') as any) || 'list',
  }));

  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();
  const { 
    sets, 
    totalCount, 
    hasMore, 
    loading, 
    error, 
    deleteFlashcardSet, 
    togglePinned,
    isDeleting, 
    prefetchNextPage,
    refetch 
  } = useEnhancedFlashcardSets(filters, page);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    if (filters.subjectFilter) params.set('subject', filters.subjectFilter);
    if (filters.timeFilter !== 'all') params.set('time', filters.timeFilter);
    if (filters.showPinnedOnly) params.set('pinned', 'true');
    if (filters.sortBy !== 'updated_at') params.set('sort', filters.sortBy);
    if (filters.viewMode !== 'list') params.set('view', filters.viewMode);
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Prefetch next page when approaching end
  useEffect(() => {
    if (sets.length > 15 && hasMore) {
      prefetchNextPage();
    }
  }, [sets.length, hasMore, prefetchNextPage]);

  const handleDeleteSet = async (setId: string) => {
    setDeletingSet(setId);
    try {
      await deleteFlashcardSet(setId);
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
    } finally {
      setDeletingSet(null);
    }
  };

  const handleTogglePinned = (setId: string, isPinned: boolean) => {
    togglePinned({ setId, isPinned });
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleRetry = () => {
    refetch();
  };

  // Create progress data for backward compatibility
  const setProgressData = sets.reduce((acc: Record<string, number>, set) => {
    acc[set.id] = set.progress_summary?.mastery_percentage || 0;
    return acc;
  }, {});

  const detailedProgressData = sets.reduce((acc: Record<string, any>, set) => {
    if (set.progress_summary) {
      acc[set.id] = set.progress_summary;
    }
    return acc;
  }, {});

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Flashcards" pageIcon={<BookOpen className="h-3 w-3" />} />
        
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-mint-800">Flashcard Sets</h1>
            <p className="text-muted-foreground">
              Study with your personalized flashcard collections
            </p>
          </div>
          <Button 
            onClick={() => navigate('/flashcards/create')}
            className="bg-mint-500 hover:bg-mint-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Set
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className="mb-6">
          <AdvancedFlashcardFilters
            filters={filters}
            onFiltersChange={setFilters}
            userSubjects={userSubjects}
            subjectsLoading={subjectsLoading}
            filteredCount={sets.length}
            totalCount={totalCount}
          />
        </div>

        {/* Content */}
        {loading && page === 1 ? (
          filters.viewMode === 'list' ? <ListLoadingSkeleton /> : <ListLoadingSkeleton />
        ) : error ? (
          <ErrorDisplay error={error} onRetry={handleRetry} />
        ) : (
          <div className="space-y-6">
            {/* Flashcard Sets Display */}
            {filters.viewMode === 'list' ? (
              <FlashcardSetListView
                sets={sets}
                onDeleteSet={handleDeleteSet}
                onTogglePinned={handleTogglePinned}
                deletingSet={deletingSet}
                detailedProgressData={detailedProgressData}
              />
            ) : (
              <FlashcardSetGrid
                sets={sets}
                setProgressData={setProgressData}
                deletingSet={deletingSet}
                onDeleteSet={handleDeleteSet}
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
                  onClick={handleLoadMore}
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
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
