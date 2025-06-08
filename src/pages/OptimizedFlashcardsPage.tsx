
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { FlashcardProvider } from '@/contexts/FlashcardContext';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { BookOpen } from 'lucide-react';
import { useOptimizedFlashcardSets } from '@/hooks/useOptimizedFlashcardSets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, PlayCircle, MoreHorizontal } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { CompactFloatingTimer } from '@/components/study/CompactFloatingTimer';

// Memoized flashcard set card component for better performance
const FlashcardSetCard = memo(({ set, onStudy, onDelete }: any) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-mint-600 transition-colors">
            {set.name}
          </CardTitle>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Study button clicked for set:', set.id);
                onStudy(set.id);
              }}
              className="h-8 w-8 p-0"
            >
              <PlayCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {set.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {set.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-mint-600">
              {set.card_count} cards
            </span>
            {set.subject && (
              <span className="text-xs bg-mint-100 text-mint-700 px-2 py-1 rounded-full">
                {set.subject}
              </span>
            )}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Main study button clicked for set:', set.id);
              onStudy(set.id);
            }}
            className="w-full mt-3 bg-mint-500 hover:bg-mint-600"
            size="sm"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Study
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

const OptimizedFlashcardsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { flashcardSets, loading, error, deleteFlashcardSet } = useOptimizedFlashcardSets();
  const [isStudyActive, setIsStudyActive] = useState(false);

  const handleStudyStart = (setId: string) => {
    console.log('handleStudyStart called with setId:', setId);
    setIsStudyActive(true);
    const studyPath = `/flashcards/${setId}/study`;
    console.log('Navigating to:', studyPath);
    navigate(studyPath);
  };

  // Memoized grid for better performance
  const flashcardGrid = useMemo(() => {
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

    if (flashcardSets.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Flashcard Sets Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first flashcard set to start studying!
          </p>
          <Button onClick={() => navigate('/flashcards/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Set
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashcardSets.map((set) => (
          <FlashcardSetCard
            key={set.id}
            set={set}
            onStudy={handleStudyStart}
            onDelete={deleteFlashcardSet}
          />
        ))}
      </div>
    );
  }, [flashcardSets, loading, error, navigate, deleteFlashcardSet]);

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        {/* Compact Floating Timer - shows on main flashcards page */}
        <CompactFloatingTimer
          activityType="flashcard"
          isActive={isStudyActive}
          className="bg-mint-500 border-mint-600"
        />

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
          {flashcardGrid}
        </FlashcardProvider>
      </div>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
