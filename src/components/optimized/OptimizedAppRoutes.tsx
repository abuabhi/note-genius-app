
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
const StudySessionsPage = lazy(() => import('@/pages/StudySessionsPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const TodoPage = lazy(() => import('@/pages/TodoPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const StudyPlannerPage = lazy(() => import('@/pages/StudyPlannerPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="space-y-4 w-full max-w-md">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);

export const OptimizedAppRoutes = () => {
  return (
    <Suspense fallback={<SidebarLayout><LoadingFallback /></SidebarLayout>}>
      <Routes>
        {/* All routes now use unified SidebarLayout */}
        <Route path="/dashboard" element={<SidebarLayout><DashboardPage /></SidebarLayout>} />
        
        {/* Flashcards routes */}
        <Route path="/flashcards" element={<SidebarLayout><FlashcardsPage /></SidebarLayout>} />
        <Route path="/flashcards/study/:id" element={<SidebarLayout><FlashcardStudyPage /></SidebarLayout>} />
        <Route path="/study/:id" element={<SidebarLayout><FlashcardStudyPage /></SidebarLayout>} />
        
        {/* Notes routes - Fixed parameter name to noteId */}
        <Route path="/notes" element={<SidebarLayout><NotesPage /></SidebarLayout>} />
        <Route path="/notes/study/:noteId" element={<SidebarLayout><NoteStudyPage /></SidebarLayout>} />
        
        {/* Quiz routes */}
        <Route path="/quiz" element={<SidebarLayout><QuizPage /></SidebarLayout>} />
        <Route path="/quizzes" element={<SidebarLayout><QuizPage /></SidebarLayout>} />
        <Route path="/quiz/create" element={<SidebarLayout><CreateQuizPage /></SidebarLayout>} />
        <Route path="/quiz/:id/take" element={<SidebarLayout><TakeQuizPage /></SidebarLayout>} />
        <Route path="/quiz/:id/view" element={<SidebarLayout><QuizDetailsPage /></SidebarLayout>} />
        <Route path="/quiz/:id" element={<SidebarLayout><QuizDetailsPage /></SidebarLayout>} />
        
        {/* Analytics and Progress */}
        <Route path="/analytics" element={<SidebarLayout><AnalyticsPage /></SidebarLayout>} />
        <Route path="/progress" element={<SidebarLayout><AnalyticsPage /></SidebarLayout>} />
        
        {/* Study Sessions - Fixed to use StudySessionsPage instead of AnalyticsPage */}
        <Route path="/study-sessions" element={<SidebarLayout><StudySessionsPage /></SidebarLayout>} />
        
        {/* Calendar and Planning */}
        <Route path="/calendar" element={<SidebarLayout><SchedulePage /></SidebarLayout>} />
        <Route path="/schedule" element={<SidebarLayout><SchedulePage /></SidebarLayout>} />
        <Route path="/study-planner" element={<SidebarLayout><StudyPlannerPage /></SidebarLayout>} />
        
        {/* Goals and Todos - Now using unified SidebarLayout */}
        <Route path="/goals" element={<SidebarLayout><GoalsPage /></SidebarLayout>} />
        <Route path="/todos" element={<SidebarLayout><TodoPage /></SidebarLayout>} />
        
        {/* Notifications route */}
        <Route path="/notifications" element={<SidebarLayout><NotificationsPage /></SidebarLayout>} />
        
        {/* Catch all for 404 */}
        <Route path="*" element={<SidebarLayout><NotFoundPage /></SidebarLayout>} />
      </Routes>
    </Suspense>
  );
};
