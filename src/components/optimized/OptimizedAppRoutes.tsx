
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';
import { NoteProvider } from '@/contexts/NoteContext';

// Lazy load all major pages for code splitting
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const EditNotePage = lazy(() => import('@/pages/EditNotePage'));
const NoteToFlashcardPage = lazy(() => import('@/pages/NoteToFlashcardPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const CreateFlashcardPage = lazy(() => import('@/pages/CreateFlashcardPage'));
const FlashcardStudyPage = lazy(() => import('@/pages/FlashcardStudyPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const StudySessionsPage = lazy(() => import('@/pages/StudySessionsPage'));

// Standard pages that don't have optimized versions yet
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const TodoPage = lazy(() => import('@/pages/TodoPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const CreateQuizPage = lazy(() => import('@/pages/CreateQuizPage'));
const TakeQuizPage = lazy(() => import('@/pages/TakeQuizPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const CollaborationPage = lazy(() => import('@/pages/CollaborationPage'));
const ConnectionsPage = lazy(() => import('@/pages/ConnectionsPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Loading components for each page type
const PageLoadingSkeleton = ({ type }: { type: 'dashboard' | 'notes' | 'flashcards' | 'progress' | 'sessions' | 'goals' | 'todos' | 'standard' }) => {
  const skeletons = {
    dashboard: (
      <Layout>
        <div className="container mx-auto p-6 space-y-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    notes: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    flashcards: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    progress: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </Layout>
    ),
    sessions: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    goals: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    todos: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    standard: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </Layout>
    )
  };

  return skeletons[type];
};

export const OptimizedAppRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="dashboard" />}>
            <DashboardPage />
          </LazyLoadWrapper>
        } 
      />
      
      {/* Notes routes - wrapped with NoteProvider */}
      <Route 
        path="/notes" 
        element={
          <NoteProvider>
            <LazyLoadWrapper fallback={<PageLoadingSkeleton type="notes" />}>
              <NotesPage />
            </LazyLoadWrapper>
          </NoteProvider>
        } 
      />
      <Route 
        path="/notes/:id" 
        element={
          <NoteProvider>
            <LazyLoadWrapper fallback={<PageLoadingSkeleton type="notes" />}>
              <NoteStudyPage />
            </LazyLoadWrapper>
          </NoteProvider>
        } 
      />
      <Route 
        path="/edit-note/:noteId" 
        element={
          <NoteProvider>
            <LazyLoadWrapper fallback={<PageLoadingSkeleton type="notes" />}>
              <EditNotePage />
            </LazyLoadWrapper>
          </NoteProvider>
        } 
      />
      <Route 
        path="/note-to-flashcard" 
        element={
          <NoteProvider>
            <LazyLoadWrapper fallback={<PageLoadingSkeleton type="notes" />}>
              <NoteToFlashcardPage />
            </LazyLoadWrapper>
          </NoteProvider>
        } 
      />
      
      {/* Flashcards */}
      <Route 
        path="/flashcards" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="flashcards" />}>
            <FlashcardsPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/flashcards/create" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="flashcards" />}>
            <CreateFlashcardPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/flashcards/:id/study" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="flashcards" />}>
            <FlashcardStudyPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/flashcards/:setId/study" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="flashcards" />}>
            <FlashcardStudyPage />
          </LazyLoadWrapper>
        } 
      />
      {/* Add the missing /study/:id route */}
      <Route 
        path="/study/:id" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="flashcards" />}>
            <FlashcardStudyPage />
          </LazyLoadWrapper>
        } 
      />
      
      {/* Progress */}
      <Route 
        path="/progress" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="progress" />}>
            <ProgressPage />
          </LazyLoadWrapper>
        } 
      />
      
      {/* Study Sessions */}
      <Route 
        path="/study-sessions" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="sessions" />}>
            <StudySessionsPage />
          </LazyLoadWrapper>
        } 
      />
      
      {/* Goals */}
      <Route 
        path="/goals" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="goals" />}>
            <GoalsPage />
          </LazyLoadWrapper>
        } 
      />
      
      {/* Todos */}
      <Route 
        path="/todos" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="todos" />}>
            <TodoPage />
          </LazyLoadWrapper>
        } 
      />
      
      {/* Quiz routes */}
      <Route 
        path="/quiz" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <QuizPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/quizzes" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <QuizPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/create-quiz" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <CreateQuizPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/quiz/:id" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <TakeQuizPage />
          </LazyLoadWrapper>
        } 
      />
      
      {/* Communication and Collaboration */}
      <Route 
        path="/chat" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <ChatPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/collaboration" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <CollaborationPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/connections" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <ConnectionsPage />
          </LazyLoadWrapper>
        } 
      />
      
      {/* Schedule */}
      <Route 
        path="/schedule" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <SchedulePage />
          </LazyLoadWrapper>
        } 
      />

      {/* Settings */}
      <Route 
        path="/settings" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <SettingsPage />
          </LazyLoadWrapper>
        } 
      />

      {/* Referrals */}
      <Route 
        path="/referrals" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="standard" />}>
            <ReferralsPage />
          </LazyLoadWrapper>
        } 
      />
    </Routes>
  );
};
