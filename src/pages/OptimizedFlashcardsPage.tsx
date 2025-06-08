
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
import { useState, useMemo } from 'react';
import FlashcardSetGrid from '@/components/flashcards/components/FlashcardSetGrid';

const OptimizedFlashcardsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { flashcardSets, loading, error, deleteFlashcardSet } = useOptimizedFlashcardSets();
  const { progressData, getSetProgress } = useFlashcardSetProgress(flashcardSets);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);

  const handleStudyStart = (setId: string) => {
    console.log('handleStudyStart called with setId:', setId);
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

  // Transform progress data for the grid component
  const setProgressData = useMemo(() => {
    const progressMap: Record<string, number> = {};
    flashcardSets.forEach(set => {
      const progress = getSetProgress(set.id);
      progressMap[set.id] = progress.masteredPercentage;
    });
    return progressMap;
  }, [flashcardSets, getSetProgress]);

  const detailedProgressData = useMemo(() => {
    const detailedMap: Record<string, any> = {};
    flashcardSets.forEach(set => {
      const progress = getSetProgress(set.id);
      detailedMap[set.id] = {
        masteredCards: progress.masteredCards,
        needsPracticeCards: progress.needsPracticeCards,
        totalCards: progress.totalCards,
        masteredPercentage: progress.masteredPercentage
      };
    });
    return detailedMap;
  }, [flashcardSets, getSetProgress]);

  // Memoized content for better performance
  const flashcardContent = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
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
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error loading flashcard sets: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      );
    }

    return (
      <FlashcardSetGrid
        sets={flashcardSets}
        setProgressData={setProgressData}
        deletingSet={deletingSet}
        onDeleteSet={handleDeleteSet}
        hasInitiallyLoaded={!loading}
        searchQuery=""
        subjectFilter={undefined}
        detailedProgressData={detailedProgressData}
      />
    );
  }, [flashcardSets, loading, error, setProgressData, detailedProgressData, deletingSet]);

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
          {flashcardContent}
        </FlashcardProvider>
      </div>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
