
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/layout/Layout';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const FlashcardStudyPage = lazy(() => import('@/pages/FlashcardStudyPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-96" />
    </div>
  </div>
);

export const OptimizedAppRoutes = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Flashcards routes */}
          <Route path="/flashcards" element={<FlashcardsPage />} />
          
          {/* Study routes - using consistent :id parameter */}
          <Route path="/flashcards/study/:id" element={<FlashcardStudyPage />} />
          <Route path="/study/:id" element={<FlashcardStudyPage />} />
          
          {/* Notes routes */}
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/study/:noteId" element={<NoteStudyPage />} />
          
          {/* Analytics */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          
          {/* Calendar/Schedule */}
          <Route path="/calendar" element={<SchedulePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          
          {/* Catch all for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};
