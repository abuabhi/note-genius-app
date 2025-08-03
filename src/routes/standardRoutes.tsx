
import React, { lazy } from 'react';
import type { RouteConfig } from './publicRoutes';
// import SidebarLayout from '@/components/layout/SidebarLayout'; // Not needed - using global SidebarProvider

// Lazy load components for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const FlashcardSetPage = lazy(() => import('@/pages/FlashcardSetPage'));
const CreateFlashcardSetPage = lazy(() => import('@/pages/CreateFlashcardSetPage'));
const CreateFlashcardPage = lazy(() => import('@/pages/CreateFlashcardPage'));
const FlashcardStudyPage = lazy(() => import('@/pages/FlashcardStudyPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const TakeQuizPage = lazy(() => import('@/pages/TakeQuizPage'));
const CreateQuizPage = lazy(() => import('@/pages/CreateQuizPage'));
const NoteToFlashcardPage = lazy(() => import('@/pages/NoteToFlashcardPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const TodoPage = lazy(() => import('@/pages/TodoPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const RemindersPage = lazy(() => import('@/pages/RemindersPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const StudyPlannerPage = lazy(() => import('@/pages/StudyPlannerPage'));
const QuizDetailsPage = lazy(() => import('@/pages/QuizDetailsPage'));
const InfluencerDashboardPage = lazy(() => import('@/pages/InfluencerDashboardPage'));

// Legacy route redirects
const ProgressPage = lazy(() => import('@/pages/AnalyticsPage'));
const StudySessionsPage = lazy(() => import('@/pages/AnalyticsPage'));

export const standardRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <DashboardPage />
  },
  {
    path: '/flashcards/create',
    element: <CreateFlashcardSetPage />
  },
  {
    path: '/flashcards/:setId/create',
    element: <CreateFlashcardPage />
  },
  {
    path: '/flashcards/study/:id',
    element: <FlashcardStudyPage />
  },
  {
    path: '/flashcards/:id',
    element: <FlashcardSetPage />
  },
  {
    path: '/flashcards/*',
    element: <FlashcardsPage />
  },
  {
    path: '/notes/study/:noteId',
    element: <NoteStudyPage />
  },
  {
    path: '/notes/*',
    element: <NotesPage />
  },
  {
    path: '/quiz/create',
    element: <CreateQuizPage />
  },
  {
    path: '/create-quiz',
    element: <CreateQuizPage />
  },
  {
    path: '/quiz/:id/take',
    element: <TakeQuizPage />
  },
  {
    path: '/quiz/:id',
    element: <QuizDetailsPage />
  },
  {
    path: '/note-to-flashcard',
    element: <NoteToFlashcardPage />
  },
  {
    path: '/quiz/*',
    element: <QuizPage />
  },
  {
    path: '/quizzes/*',
    element: <QuizPage />
  },
  {
    path: '/quizzes',
    element: <QuizPage />
  },
  {
    path: '/analytics',
    element: <AnalyticsPage />
  },
  // Legacy redirects - these will render the new AnalyticsPage
  {
    path: '/progress',
    element: <ProgressPage />
  },
  {
    path: '/study-sessions',
    element: <StudySessionsPage />
  },
  {
    path: '/goals',
    element: <GoalsPage />
  },
  {
    path: '/todos',
    element: <TodoPage />
  },
  {
    path: '/schedule',
    element: <SchedulePage />
  },
  {
    path: '/study-planner',
    element: <StudyPlannerPage />
  },
  {
    path: '/reminders',
    element: <RemindersPage />
  },
  {
    path: '/settings',
    element: <SettingsPage />
  },
  {
    path: '/feedback',
    element: <FeedbackPage />
  },
  {
    path: '/referrals',
    element: <ReferralsPage />
  },
  {
    path: '/help',
    element: <HelpPage />
  },
  {
    path: '/faq',
    element: <FAQPage />
  },
  {
    path: '/influencer',
    element: <InfluencerDashboardPage />
  }
];
