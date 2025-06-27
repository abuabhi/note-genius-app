
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import SidebarLayout from '@/components/layout/SidebarLayout';

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
        <Route path="/dashboard" element={<SidebarLayout><DashboardPage /></SidebarLayout>} />
        
        {/* Flashcards routes */}
        <Route path="/flashcards" element={<SidebarLayout><FlashcardsPage /></SidebarLayout>} />
        
        {/* Study routes - now include SidebarLayout for consistent sidebar */}
        <Route path="/flashcards/study/:id" element={<SidebarLayout><FlashcardStudyPage /></SidebarLayout>} />
        <Route path="/study/:id" element={<SidebarLayout><FlashcardStudyPage /></SidebarLayout>} />
        
        {/* Notes routes */}
        <Route path="/notes" element={<SidebarLayout><NotesPage /></SidebarLayout>} />
        <Route path="/notes/study/:noteId" element={<NoteStudyPage />} />
        
        {/* Quiz routes */}
        <Route path="/quiz" element={<SidebarLayout><QuizPage /></SidebarLayout>} />
        <Route path="/quizzes" element={<SidebarLayout><QuizPage /></SidebarLayout>} />
        <Route path="/quiz/create" element={<SidebarLayout><CreateQuizPage /></SidebarLayout>} />
        <Route path="/quiz/:id/take" element={<TakeQuizPage />} />
        <Route path="/quiz/:id/view" element={<SidebarLayout><QuizDetailsPage /></SidebarLayout>} />
        <Route path="/quiz/:id" element={<SidebarLayout><QuizDetailsPage /></SidebarLayout>} />
        
        {/* Analytics */}
        <Route path="/analytics" element={<SidebarLayout><AnalyticsPage /></SidebarLayout>} />
        <Route path="/progress" element={<SidebarLayout><AnalyticsPage /></SidebarLayout>} />
        
        {/* Calendar/Schedule */}
        <Route path="/calendar" element={<SidebarLayout><SchedulePage /></SidebarLayout>} />
        <Route path="/schedule" element={<SidebarLayout><SchedulePage /></SidebarLayout>} />
        
        {/* Goals and Todos - now with SidebarLayout */}
        <Route path="/goals" element={<SidebarLayout><GoalsPage /></SidebarLayout>} />
        <Route path="/todos" element={<SidebarLayout><TodoPage /></SidebarLayout>} />
        
        {/* Study Planner */}
        <Route path="/study-planner" element={<SidebarLayout><StudyPlannerPage /></SidebarLayout>} />
        
        {/* Catch all for 404 */}
        <Route path="*" element={<SidebarLayout><NotFoundPage /></SidebarLayout>} />
      </Routes>
    </Suspense>
  );
};
