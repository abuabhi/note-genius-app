
import React, { Suspense } from 'react';
import { useFlashcardSets } from '@/contexts/flashcards';
import { useOptimizedQueries } from '@/hooks/performance/useOptimizedQueries';
import Layout from '@/components/layout/Layout';

// Lazy load heavy components
const FlashcardSetFilters = React.lazy(() => import('@/components/flashcards/components/FlashcardSetFilters'));
const FlashcardSetGrid = React.lazy(() => import('@/components/flashcards/components/FlashcardSetGrid'));

const OptimizedFlashcardsPage = () => {
  const { data: flashcardSets, isLoading } = useFlashcardSets();
  const { prefetchData } = useOptimizedQueries();

  // Prefetch related data
  React.useEffect(() => {
    prefetchData(['flashcardProgress', 'studyAnalytics']);
  }, [prefetchData]);

  const handleStudySet = (setId: string) => {
    // Navigate to study mode
    console.log('Starting study session for set:', setId);
  };

  const handleEditSet = (setId: string) => {
    // Navigate to edit mode
    console.log('Editing set:', setId);
  };

  const handleDeleteSet = (setId: string) => {
    // Delete set
    console.log('Deleting set:', setId);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcard Sets</h1>
          <p className="text-gray-600">Study with your flashcard collections</p>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<div className="h-16 bg-gray-100 rounded animate-pulse" />}>
            <FlashcardSetFilters />
          </Suspense>

          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          }>
            <FlashcardSetGrid 
              sets={flashcardSets}
              onStudy={handleStudySet}
              onEdit={handleEditSet}
              onDelete={handleDeleteSet}
            />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
