
import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOptimizedFlashcardSets } from "@/hooks/useOptimizedFlashcardSets";
import { FlashcardsPageHeader } from "@/components/flashcards/page/FlashcardsPageHeader";
import { FlashcardsContent } from "@/components/flashcards/page/FlashcardsContent";
import { AdvancedFlashcardFilters } from "@/components/flashcards/components/AdvancedFlashcardFilters";
import { VisualFloatingTimer } from "@/components/study/VisualFloatingTimer";
import { useViewPreferences } from "@/hooks/useViewPreferences";
import type { FlashcardFilters } from "@/components/flashcards/components/AdvancedFlashcardFilters";

const OptimizedFlashcardsPage = () => {
  console.log('🏠 OptimizedFlashcardsPage component rendering');
  
  useRequireAuth();
  const { viewMode, setViewMode } = useViewPreferences('flashcards', 'grid');
  
  const [filters, setFilters] = useState<FlashcardFilters>({
    searchQuery: '',
    subjectFilter: 'all',
    difficultyFilter: 'all',
    progressFilter: 'all',
    sortBy: 'updated_at',
    sortOrder: 'desc',
    viewMode: viewMode, // Initialize from preferences but don't use for filtering
    showPinnedOnly: false
  });

  const [page, setPage] = useState(1);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);

  // Sync viewMode changes to filters (for backward compatibility)
  const effectiveFilters = useMemo(() => ({
    ...filters,
    viewMode
  }), [filters, viewMode]);

  const {
    allSets,
    loading,
    error,
    hasMore,
    detailedProgressData,
    deleteFlashcardSet,
    updateFlashcardSet,
    retryFetch
  } = useOptimizedFlashcardSets({
    filters: effectiveFilters,
    page,
    pageSize: 12
  });

  const handleDeleteSet = async (setId: string) => {
    setDeletingSet(setId);
    try {
      await deleteFlashcardSet.mutateAsync(setId);
    } finally {
      setDeletingSet(null);
    }
  };

  const handleTogglePinned = async (setId: string, isPinned: boolean) => {
    await updateFlashcardSet.mutateAsync({
      id: setId,
      updates: { is_pinned: isPinned }
    });
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleRetry = () => {
    setPage(1);
    retryFetch();
  };

  return (
    <Layout>
      <VisualFloatingTimer />
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
            filters={effectiveFilters}
            loading={loading}
            error={error}
            hasMore={hasMore}
            page={page}
            deletingSet={deletingSet}
            detailedProgressData={detailedProgressData}
            onDeleteSet={handleDeleteSet}
            onTogglePinned={handleTogglePinned}
            onLoadMore={handleLoadMore}
            onRetry={handleRetry}
          />
        </div>
      </div>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
