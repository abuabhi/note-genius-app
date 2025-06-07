
import React, { Suspense } from 'react';
import { useOptimizedStudySessions } from '@/hooks/performance/useOptimizedStudySessions';
import Layout from '@/components/layout/Layout';

// Lazy load components with proper default export handling
const LearningAnalyticsDashboard = React.lazy(() => 
  import('@/components/dashboard/LearningAnalyticsDashboard').then(module => ({ default: module.LearningAnalyticsDashboard || module.default }))
);

const OptimizedStudySessionsPage = () => {
  const { data, isLoading, isPartiallyLoaded, prefetchNextSession } = useOptimizedStudySessions();

  // Prefetch next session data on component mount
  React.useEffect(() => {
    if (isPartiallyLoaded) {
      prefetchNextSession();
    }
  }, [isPartiallyLoaded, prefetchNextSession]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Sessions</h1>
          <p className="text-gray-600">Track and analyze your study performance</p>
        </div>

        <div className="space-y-8">
          <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
            <LearningAnalyticsDashboard data={data} />
          </Suspense>

          {/* Recent Sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
            <div className="space-y-3">
              {data.basic.recentSessions.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h3 className="font-medium">{session.subject}</h3>
                    <p className="text-sm text-gray-600">
                      {session.duration ? `${Math.round(session.duration / 60)} minutes` : 'In progress'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{session.cards_correct}/{session.cards_reviewed}</p>
                    <p className="text-sm text-gray-600">Cards</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OptimizedStudySessionsPage;
