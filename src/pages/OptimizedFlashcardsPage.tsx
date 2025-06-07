
import React, { Suspense } from 'react';
import { useFlashcards } from '@/contexts/flashcards/index';
import { useOptimizedQuery } from '@/hooks/performance/useOptimizedQueries';
import Layout from '@/components/layout/Layout';

// Lazy load heavy components
const FlashcardSetFilters = React.lazy(() => import('@/components/flashcards/components/FlashcardSetFilters'));
const FlashcardSetGrid = React.lazy(() => import('@/components/flashcards/components/FlashcardSetGrid'));

const OptimizedFlashcardsPage = () => {
  const { flashcardSets, loading } = useFlashcards();
  const { prefetchData } = useOptimizedQuery();

  // Extract data and loading state from context
  const isLoading = loading.sets || false;

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
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <p className="text-gray-600">Filter controls coming soon...</p>
            </div>
          </Suspense>

          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          }>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcardSets.map((set: any) => (
                <div key={set.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{set.name}</h3>
                  <p className="text-gray-600 mb-4">{set.description}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStudySet(set.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Study
                    </button>
                    <button 
                      onClick={() => handleEditSet(set.id)}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteSet(set.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default OptimizedFlashcardsPage;
