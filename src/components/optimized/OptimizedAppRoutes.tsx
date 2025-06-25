
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Layout from '@/components/layout/Layout';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const FlashcardStudyPage = lazy(() => import('@/pages/FlashcardStudyPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const OptimizedAppRoutes = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
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
          
          {/* Calendar */}
          <Route path="/calendar" element={<CalendarPage />} />
          
          {/* Catch all for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};
