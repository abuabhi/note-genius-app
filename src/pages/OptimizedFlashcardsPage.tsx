
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { FlashcardProvider } from '@/contexts/FlashcardContext';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { BookOpen } from 'lucide-react';
import { useOptimizedFlashcardSets } from '@/hooks/useOptimizedFlashcardSets';
import { useFlashcardSetProgress } from '@/hooks/useFlashcardSetProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useState, useMemo, Suspense } from 'react';
import FlashcardSetGrid from '@/components/flashcards/components/FlashcardSetGrid';

// Skeleton component for loading state
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Error component
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="text-center py-12">
    <p className="text-red-600 mb-4">Error loading flashcard sets: {error}</p>
    <Button onClick={onRetry}>Try Again</Button>
  </div>
);

const OptimizedFlashcardsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { allSets, loading, error, deleteFlashcardSet, isDeleting, prefetchFlashcards } = useOptimizedFlashcardSets();
  const { progressData, getSetProgress } = useFlashcardSetProgress(allSets);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);

  const handleStudyStart = (setId: string) => {
    console.log('handleStudyStart called with setId:', setId);
    // Prefetch data for faster loading
    prefetchFlashcards(setId);
    const studyPath = `/flashcards/${setId}/study`;
    console.log('Navigating to:', studyPath);
    navigate(studyPath);
  };

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

  // Optimized progress data calculation with early return
  const setProgressData = useMemo(() => {
    if (!allSets.length) return {};
    
    const progressMap: Record<string, number> = {};
    allSets.forEach(set => {
      const progress = getSetProgress(set.id);
      progressMap[set.id] = progress.masteredPercentage;
    });
    return progressMap;
  }, [allSets, getSetProgress]);

  const detailedProgressData = useMemo(() => {
    if (!allSets.length) return {};
    
    const detailedMap: Record<string, any> = {};
    allSets.forEach(set => {
      const progress = getSetProgress(set.id);
      detailedMap[set.id] = {
        masteredCards: progress.masteredCards,
        needsPracticeCards: progress.needsPracticeCards,
        totalCards: progress.totalCards,
        masteredPercentage: progress.masteredPercentage
      };
    });
    return detailedMap;
  }, [allSets, getSetProgress]);

  // Handle retry for error state
  const handleRetry = () => {
    window.location.reload();
  };

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

        <FlashcardProvider>
          <Suspense fallback={<LoadingSkeleton />}>
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <ErrorDisplay error={error} onRetry={handleRetry} />
            ) : (
              <FlashcardSetGrid
                sets={allSets}
                setProgressData={setProgressData}
                deletingSet={deletingSet}
                onDeleteSet={handleDeleteSet}
                hasInitiallyLoaded={!loading}
                searchQuery=""
                subjectFilter={undefined}
                detailedProgressData={detailedProgressData}
              />
            )}
          </Suspense>
        </FlashcardProvider>
      </div>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
