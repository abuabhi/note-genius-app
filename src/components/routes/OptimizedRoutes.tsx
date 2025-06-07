
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

// Lazy load all page components
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const OptimizedNoteStudyPage = lazy(() => import('@/pages/OptimizedNoteStudyPage'));

// Global loading component for route transitions
const RouteLoadingSkeleton = () => (
  <Layout>
    <div className="container mx-auto p-4 md:p-6">
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </Layout>
);

export const OptimizedRoutes = () => {
  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/:id" element={<OptimizedNoteStudyPage />} />
        {/* Add other routes as needed */}
      </Routes>
    </Suspense>
  );
};
