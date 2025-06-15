import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';
import Layout from '@/components/layout/Layout';

// Lazy load components
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ScalableNotesPage = lazy(() => import('@/pages/ScalableNotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const OptimizedNoteStudyPage = lazy(() => import('@/pages/OptimizedNoteStudyPage'));
const EditNotePage = lazy(() => import('@/pages/EditNotePage'));
const NoteToFlashcardPage = lazy(() => import('@/pages/NoteToFlashcardPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const FlashcardStudyPage = lazy(() => import('@/pages/FlashcardStudyPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const TodosPage = lazy(() => import('@/pages/TodosPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const RemindersPage = lazy(() => import('@/pages/RemindersPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const CollaborationPage = lazy(() => import('@/pages/CollaborationPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));

// Loading component
const RouteLoader = () => (
  <Layout>
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-500"></div>
    </div>
  </Layout>
);

export const OptimizedAppRoutes = () => {
  return (
    <OptimizedNotesProvider>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Notes routes */}
          <Route path="/notes" element={<ScalableNotesPage />} />
          <Route path="/notes/edit/:noteId" element={<EditNotePage />} />
          <Route path="/notes/study/:id" element={<NoteStudyPage />} />
          <Route path="/notes/to-flashcard" element={<NoteToFlashcardPage />} />
          
          {/* Flashcards routes */}
          <Route path="/flashcards/*" element={<FlashcardsPage />} />
          <Route path="/flashcards/study/:id" element={<FlashcardStudyPage />} />
          
          {/* Quiz routes */}
          <Route path="/quiz/*" element={<QuizPage />} />
          <Route path="/quizzes/*" element={<QuizPage />} />
          
          {/* Other routes */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/todos" element={<TodosPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/referrals" element={<ReferralsPage />} />
          <Route path="/collaboration" element={<CollaborationPage />} />
          <Route path="/chat/*" element={<ChatPage />} />
          
          {/* Legacy redirects */}
          <Route path="/progress" element={<AnalyticsPage />} />
          <Route path="/study-sessions" element={<AnalyticsPage />} />
        </Routes>
      </Suspense>
    </OptimizedNotesProvider>
  );
};
