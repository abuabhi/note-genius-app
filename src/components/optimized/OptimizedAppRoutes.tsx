import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const EditNotePage = lazy(() => import('@/pages/EditNotePage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const CreateFlashcardPage = lazy(() => import('@/pages/CreateFlashcardPage'));
const EditFlashcardPage = lazy(() => import('@/pages/EditFlashcardPage'));
const FlashcardSetPage = lazy(() => import('@/pages/FlashcardSetPage'));
const FlashcardStudyPage = lazy(() => import('@/pages/FlashcardStudyPage'));
const FlashcardLibraryPage = lazy(() => import('@/pages/FlashcardLibraryPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const CreateQuizPage = lazy(() => import('@/pages/CreateQuizPage'));
const TakeQuizPage = lazy(() => import('@/pages/TakeQuizPage'));
const QuizHistoryPage = lazy(() => import('@/pages/QuizHistoryPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const TodoPage = lazy(() => import('@/pages/TodoPage'));
const StudySessionsPage = lazy(() => import('@/pages/StudySessionsPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const NoteToFlashcardPage = lazy(() => import('@/pages/NoteToFlashcardPage'));
const CollaborationPage = lazy(() => import('@/pages/CollaborationPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const ConnectionsPage = lazy(() => import('@/pages/ConnectionsPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const AdminFeedbackPage = lazy(() => import('@/pages/AdminFeedbackPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));

export const OptimizedAppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={
          <LazyLoadWrapper>
            <DashboardPage />
          </LazyLoadWrapper>
        } />
        
        {/* Notes routes */}
        <Route path="/notes" element={
          <LazyLoadWrapper>
            <NotesPage />
          </LazyLoadWrapper>
        } />
        <Route path="/notes/:noteId" element={
          <LazyLoadWrapper>
            <EditNotePage />
          </LazyLoadWrapper>
        } />
        <Route path="/notes/study/:noteId" element={
          <LazyLoadWrapper>
            <NoteStudyPage />
          </LazyLoadWrapper>
        } />
        <Route path="/notes/convert/:noteId" element={
          <LazyLoadWrapper>
            <NoteToFlashcardPage />
          </LazyLoadWrapper>
        } />
        
        {/* Flashcards routes - Updated to use consistent :id parameter */}
        <Route path="/flashcards" element={
          <LazyLoadWrapper>
            <FlashcardsPage />
          </LazyLoadWrapper>
        } />
        <Route path="/flashcards/create" element={
          <LazyLoadWrapper>
            <CreateFlashcardPage />
          </LazyLoadWrapper>
        } />
        <Route path="/flashcards/edit/:id" element={
          <LazyLoadWrapper>
            <EditFlashcardPage />
          </LazyLoadWrapper>
        } />
        {/* Fixed to use :id parameter consistently with standardRoutes */}
        <Route path="/flashcards/sets/:id" element={
          <LazyLoadWrapper>
            <FlashcardSetPage />
          </LazyLoadWrapper>
        } />
        <Route path="/flashcards/study/:id" element={
          <LazyLoadWrapper>
            <FlashcardStudyPage />
          </LazyLoadWrapper>
        } />
        <Route path="/flashcards/library" element={
          <LazyLoadWrapper>
            <FlashcardLibraryPage />
          </LazyLoadWrapper>
        } />
        
        {/* Quiz routes - Fixed both /quiz and /quizzes to point to the same component */}
        <Route path="/quiz" element={
          <LazyLoadWrapper>
            <QuizPage />
          </LazyLoadWrapper>
        } />
        <Route path="/quizzes" element={
          <LazyLoadWrapper>
            <QuizPage />
          </LazyLoadWrapper>
        } />
        <Route path="/quiz/create" element={
          <LazyLoadWrapper>
            <CreateQuizPage />
          </LazyLoadWrapper>
        } />
        <Route path="/quiz/take/:id" element={
          <LazyLoadWrapper>
            <TakeQuizPage />
          </LazyLoadWrapper>
        } />
        <Route path="/quiz/history" element={
          <LazyLoadWrapper>
            <QuizHistoryPage />
          </LazyLoadWrapper>
        } />
        
        {/* Pricing route */}
        <Route path="/pricing" element={
          <LazyLoadWrapper>
            <PricingPage />
          </LazyLoadWrapper>
        } />
        
        {/* Other routes */}
        <Route path="/goals" element={
          <LazyLoadWrapper>
            <GoalsPage />
          </LazyLoadWrapper>
        } />
        <Route path="/progress" element={
          <LazyLoadWrapper>
            <ProgressPage />
          </LazyLoadWrapper>
        } />
        <Route path="/feedback" element={
          <LazyLoadWrapper>
            <FeedbackPage />
          </LazyLoadWrapper>
        } />
        <Route path="/schedule" element={
          <LazyLoadWrapper>
            <SchedulePage />
          </LazyLoadWrapper>
        } />
        <Route path="/settings" element={
          <LazyLoadWrapper>
            <SettingsPage />
          </LazyLoadWrapper>
        } />
        <Route path="/todos" element={
          <LazyLoadWrapper>
            <TodoPage />
          </LazyLoadWrapper>
        } />
        <Route path="/study-sessions" element={
          <LazyLoadWrapper>
            <StudySessionsPage />
          </LazyLoadWrapper>
        } />
        <Route path="/collaboration" element={
          <LazyLoadWrapper>
            <CollaborationPage />
          </LazyLoadWrapper>
        } />
        <Route path="/chat" element={
          <LazyLoadWrapper>
            <ChatPage />
          </LazyLoadWrapper>
        } />
        <Route path="/connections" element={
          <LazyLoadWrapper>
            <ConnectionsPage />
          </LazyLoadWrapper>
        } />
        <Route path="/notifications" element={
          <LazyLoadWrapper>
            <NotificationsPage />
          </LazyLoadWrapper>
        } />
        <Route path="/referrals" element={
          <LazyLoadWrapper>
            <ReferralsPage />
          </LazyLoadWrapper>
        } />
        
        {/* Admin routes */}
        <Route path="/admin/feedback" element={
          <LazyLoadWrapper>
            <AdminFeedbackPage />
          </LazyLoadWrapper>
        } />
      </Routes>
    </Suspense>
  );
};
