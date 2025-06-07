
import React, { Suspense } from 'react';
import { useOptimizedProgress } from '@/hooks/performance/useOptimizedProgress';
import Layout from '@/components/layout/Layout';

// Lazy load components - simplified approach
const AnalyticsSection = React.lazy(() => 
  import('@/components/dashboard/AnalyticsSection')
);
const GoalsGrid = React.lazy(() => 
  import('@/components/goals/GoalsGrid')
);

const OptimizedProgressPage = () => {
  const { data, isLoading } = useOptimizedProgress();

  // Prefetch next data on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        // Prefetch next data when near bottom of page
        console.log('Prefetching next data...');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="space-y-8">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Dashboard</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        <div className="space-y-8">
          <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
            <AnalyticsSection />
          </Suspense>

          <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
            <GoalsGrid />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default OptimizedProgressPage;
