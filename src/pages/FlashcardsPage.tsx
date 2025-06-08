
import React from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOptimizedFlashcardSets } from "@/hooks/useOptimizedFlashcardSets";
import { FlashcardsPageHeader } from "@/components/flashcards/page/FlashcardsPageHeader";
import { FlashcardsContent } from "@/components/flashcards/page/FlashcardsContent";
import { AdvancedFlashcardFilters } from "@/components/flashcards/components/AdvancedFlashcardFilters";
import { useViewPreferences } from "@/hooks/useViewPreferences";
import { useFlashcardsPageState } from "@/components/flashcards/page/useFlashcardsPageState";
import { ErrorBoundary } from "@/components/flashcards/components/ErrorBoundary";
import { ProductionMonitoring } from "@/components/performance/ProductionMonitoring";
import { useEnhancedRetry } from "@/hooks/performance/useEnhancedRetry";
import { toast } from "sonner";

const FlashcardsPage = () => {
  console.log('🏠 FlashcardsPage component rendering');
  
  useRequireAuth();
  const { viewMode, setViewMode } = useViewPreferences('flashcards', 'grid');
  const { filters, page, deletingSet, setFilters, setPage, setDeletingSet } = useFlashcardsPageState();
  const { executeWithRetry } = useEnhancedRetry();

  const {
    allSets,
    loading,
    error,
    deleteFlashcardSet,
    refetch
  } = useOptimizedFlashcardSets({
    filters,
    page,
    pageSize: 12
  });

  const handleDeleteSet = async (setId: string) => {
    setDeletingSet(setId);
    try {
      await executeWithRetry(
        () => Promise.resolve(deleteFlashcardSet(setId)),
        'Delete flashcard set'
      );
      toast.success('Flashcard set deleted successfully');
    } catch (error) {
      console.error('Failed to delete flashcard set:', error);
      toast.error('Failed to delete flashcard set');
    } finally {
      setDeletingSet(null);
    }
  };

  const handleTogglePinned = async (setId: string, isPinned: boolean) => {
    try {
      await executeWithRetry(async () => {
        // This would be implemented with the update mutation
        console.log('Toggle pinned:', setId, isPinned);
        return Promise.resolve();
      }, 'Toggle pin status');
      toast.success(isPinned ? 'Set pinned' : 'Set unpinned');
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      toast.error('Failed to update set');
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleRetry = async () => {
    setPage(1);
    const result = await refetch();
    return result.data || result;
  };

  return (
    <ErrorBoundary>
      <Layout>
        <ProductionMonitoring />
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <div className="container mx-auto p-6 space-y-6">
            <FlashcardsPageHeader 
              loading={loading}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            
            <AdvancedFlashcardFilters
              filters={filters}
              onFiltersChange={setFilters}
              totalSets={allSets.length}
              hideViewMode={true}
            />
            
            <FlashcardsContent
              sets={allSets}
              filters={filters}
              loading={loading}
              error={error}
              hasMore={false}
              page={page}
              deletingSet={deletingSet}
              detailedProgressData={{}}
              onDeleteSet={handleDeleteSet}
              onTogglePinned={handleTogglePinned}
              onLoadMore={handleLoadMore}
              onRetry={handleRetry}
            />
          </div>
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default FlashcardsPage;
