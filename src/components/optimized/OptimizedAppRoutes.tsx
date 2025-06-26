
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
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const CreateQuizPage = lazy(() => import('@/pages/CreateQuizPage'));
const TakeQuizPage = lazy(() => import('@/pages/TakeQuizPage'));
const QuizDetailsPage = lazy(() => import('@/pages/QuizDetailsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const TodoPage = lazy(() => import('@/pages/TodoPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const StudyPlannerPage = lazy(() => import('@/pages/StudyPlannerPage'));
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
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        
        {/* Flashcards routes */}
        <Route path="/flashcards" element={<Layout><FlashcardsPage /></Layout>} />
        
        {/* Study routes - now include Layout for consistent header/sidebar */}
        <Route path="/flashcards/study/:id" element={<Layout><FlashcardStudyPage /></Layout>} />
        <Route path="/study/:id" element={<Layout><FlashcardStudyPage /></Layout>} />
        
        {/* Notes routes */}
        <Route path="/notes" element={<Layout><NotesPage /></Layout>} />
        <Route path="/notes/study/:noteId" element={<NoteStudyPage />} />
        
        {/* Quiz routes - Fixed routing structure */}
        <Route path="/quiz" element={<Layout><QuizPage /></Layout>} />
        <Route path="/quizzes" element={<Layout><QuizPage /></Layout>} />
        <Route path="/quiz/create" element={<Layout><CreateQuizPage /></Layout>} />
        <Route path="/quiz/:id/take" element={<TakeQuizPage />} />
        <Route path="/quiz/:id/view" element={<Layout><QuizDetailsPage /></Layout>} />
        <Route path="/quiz/:id" element={<Layout><QuizDetailsPage /></Layout>} />
        
        {/* Analytics - Enhanced routing */}
        <Route path="/analytics" element={<Layout><AnalyticsPage /></Layout>} />
        <Route path="/progress" element={<Layout><AnalyticsPage /></Layout>} />
        
        {/* Calendar/Schedule */}
        <Route path="/calendar" element={<Layout><SchedulePage /></Layout>} />
        <Route path="/schedule" element={<Layout><SchedulePage /></Layout>} />
        
        {/* Goals and Todos - Added routes without Layout wrapper since they already have their own Layout */}
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/todos" element={<TodoPage />} />
        
        {/* Study Planner */}
        <Route path="/study-planner" element={<Layout><StudyPlannerPage /></Layout>} />
        
        {/* Catch all for 404 */}
        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </Suspense>
  );
};
