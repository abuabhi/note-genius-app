
import { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { useEnhancedFlashcardSets } from '@/hooks/useEnhancedFlashcardSets';
import AdvancedFlashcardFilters from '@/components/flashcards/components/AdvancedFlashcardFilters';
import ErrorBoundary from '@/components/flashcards/components/ErrorBoundary';
import { FlashcardsPageHeader } from '@/components/flashcards/page/FlashcardsPageHeader';
import { FlashcardsContent } from '@/components/flashcards/page/FlashcardsContent';
import { useFlashcardsPageState } from '@/components/flashcards/page/useFlashcardsPageState';

const OptimizedFlashcardsPage = () => {
  const { 
    filters, 
    setFilters, 
    page, 
    setPage, 
    deletingSet, 
    setDeletingSet 
  } = useFlashcardsPageState();

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
    isTogglingPinned,
    prefetchNextPage,
    refetch 
  } = useEnhancedFlashcardSets(filters, page);

  // Enhanced prefetching with error handling
  useEffect(() => {
    if (sets.length > 15 && hasMore) {
      try {
        prefetchNextPage();
      } catch (error) {
        console.warn('⚠️ Prefetch failed (non-critical):', error);
      }
    }
  }, [sets.length, hasMore, prefetchNextPage]);

  const handleDeleteSet = async (setId: string) => {
    if (isDeleting) return;
    
    setDeletingSet(setId);
    try {
      await deleteFlashcardSet(setId);
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
    } finally {
      setDeletingSet(null);
    }
  };

  const handleTogglePinned = async (setId: string, isPinned: boolean) => {
    if (isTogglingPinned) return;
    
    try {
      await togglePinned({ setId, isPinned });
    } catch (error) {
      console.error('Error toggling pinned status:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  // Create progress data for backward compatibility
  const detailedProgressData = sets.reduce((acc: Record<string, any>, set) => {
    if (set.progress_summary) {
      acc[set.id] = {
        masteredCards: set.progress_summary.mastered_cards,
        needsPracticeCards: set.progress_summary.needs_practice,
        totalCards: set.progress_summary.total_cards,
        masteredPercentage: set.progress_summary.mastery_percentage,
      };
    }
    return acc;
  }, {});

  return (
    <Layout>
      <ErrorBoundary>
        <div className="container mx-auto p-4 md:p-6">
          <FlashcardsPageHeader loading={loading && page === 1} />

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
          <FlashcardsContent
            sets={sets}
            filters={filters}
            loading={loading}
            error={error}
            hasMore={hasMore}
            page={page}
            deletingSet={deletingSet}
            detailedProgressData={detailedProgressData}
            onDeleteSet={handleDeleteSet}
            onTogglePinned={handleTogglePinned}
            onLoadMore={handleLoadMore}
            onRetry={refetch}
          />
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
